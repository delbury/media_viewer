import { CodecName, MediaDetailInfo } from '#pkgs/shared/index.js';
import { logError, logWarn as RawLogWarn, switchFnByFlag } from '#pkgs/tools/common.js';
import { ParameterizedContext } from 'koa';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { VIDEO_TRANSFORM_MAX_HEIGHT, VIDEO_TRANSFORM_MAX_WIDTH } from '../config';
import { ERROR_MSG } from '../i18n/errorMsg';
import { execCommand, getFilePathHash } from './common';
import { logCommand } from './debug';

interface VideoDetailTasks {
  [key: string]: {
    done: boolean;
    data?: MediaDetailInfo;
    promise?: Promise<MediaDetailInfo>;
  };
}
// 进行中的任务信息
const VIDEO_DETAIL_TASKS: VideoDetailTasks = {};

const logWarn = switchFnByFlag(RawLogWarn, false);

// 获取视频详细信息
export const getMediaDetail = async (
  filaPath: string,
  {
    forceUpdate,
  }: {
    forceUpdate?: boolean;
  } = {}
) => {
  const task = VIDEO_DETAIL_TASKS[filaPath];
  if (task && !forceUpdate) {
    // 有缓存则取缓存
    if (task.done) return VIDEO_DETAIL_TASKS[filaPath].data;

    // 有任务则等待任务完成并返回结果
    return await VIDEO_DETAIL_TASKS[filaPath].promise;
  }

  // 没有缓存或者正在进行的任务，则创建新任务
  VIDEO_DETAIL_TASKS[filaPath] = {
    done: false,
    promise: new Promise((resolve, reject) => {
      try {
        const command = [
          'ffprobe -v error',
          '-print_format json',
          '-show_streams',
          '-show_format',
          `"${filaPath}"`,
        ].join(' ');
        execCommand(command)
          .then(({ stdout }) => {
            const info = JSON.parse(stdout as string);
            VIDEO_DETAIL_TASKS[filaPath].data = info;
            VIDEO_DETAIL_TASKS[filaPath].done = true;
            VIDEO_DETAIL_TASKS[filaPath].promise = void 0;
            resolve(info);
          })
          .catch(error => {
            Reflect.deleteProperty(VIDEO_DETAIL_TASKS, filaPath);
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  };

  return await VIDEO_DETAIL_TASKS[filaPath].promise;
};

const CODEC_CUVID_MAP = {
  av1: 'av1_cuvid',
  h264: 'h264_cuvid',
  hevc: 'hevc_cuvid',
  mjpeg: 'mjpeg_cuvid',
  mpeg1video: 'mpeg1_cuvid',
  mpeg2video: 'mpeg2_cuvid',
  mpeg4: 'mpeg4_cuvid',
  vc1: 'vc1_cuvid',
  vp8: 'vp8_cuvid',
  vp9: 'vp9_cuvid',
} satisfies Record<CodecName, string>;

// 判断源视频的编码格式，选择不同的 cuvid 解码器
const getVideoFileCuvid = async (filePath: string) => {
  const metadata = await getMediaDetail(filePath);
  const codecName = metadata?.streams?.find(s => s.codec_type === 'video')?.codec_name as CodecName;
  const cuvid = CODEC_CUVID_MAP[codecName];
  if (!cuvid) throw new Error(ERROR_MSG.notSupportVideoCodec);
  return { cuvid, metadata };
};

// 缓存进程信息，暂时只允许同时出现一个进程
const CACHED_INFO: { cp: ChildProcessWithoutNullStreams | null; hash: string | null } = {
  cp: null,
  hash: null,
};
const setProcess = (cp: ChildProcessWithoutNullStreams, hash: string) => {
  CACHED_INFO.cp = cp;
  CACHED_INFO.hash = hash;
};
const killProcess = () => {
  const cp = CACHED_INFO.cp;
  if (cp && cp.exitCode === null && !cp.killed) {
    cp.kill('SIGTERM');
    logWarn(`${CACHED_INFO.hash}: ffmpeg stream kill`);
  }
  CACHED_INFO.cp = null;
  CACHED_INFO.hash = null;
};

const SEGMENT_START_TIME_THRESHOLD = 5;

interface SegmentOptions {
  start: number;
  duration: number;
}
// 转码处理视频流 或 视频分片
export const transformVideoStream = async (
  ctx: ParameterizedContext,
  filePath: string,
  segOpt?: SegmentOptions
) => {
  // 关闭之前的进程
  killProcess();
  const hash = getFilePathHash(filePath);

  // 根据源文件的编码类型，选择不同的解码器
  const { cuvid } = await getVideoFileCuvid(filePath);

  const inputArgs: string[] = ['-c:v', cuvid, '-i', `${filePath}`];

  // 处理分片
  if (segOpt) {
    const { start, duration } = segOpt;
    if (duration === 0) throw new Error(ERROR_MSG.invalid);
    // 将时间跳转分为两个部分，用于粗略和精确定位

    let restTime = start;
    if (restTime > SEGMENT_START_TIME_THRESHOLD) {
      const preTime = start - SEGMENT_START_TIME_THRESHOLD;
      restTime = SEGMENT_START_TIME_THRESHOLD;

      const preSegArgs = ['-ss', `${preTime}`];
      inputArgs.unshift(...preSegArgs);
    }

    const segArgs = ['-ss', `${restTime}`, '-t', `${duration}`];
    inputArgs.push(...segArgs);
  }

  // 转码命令
  /* prettier-ignore */
  const args = [
    // 忽略无用提示
    '-y', '-hide_banner', '-loglevel', 'error',

    // 硬件加速
    '-init_hw_device', 'cuda=cuda:0',
    '-filter_hw_device', 'cuda',
    '-hwaccel', 'cuda',
    '-hwaccel_output_format', 'cuda',
    '-extra_hw_frames', '4',

    // 系统优化
    '-threads', '0',
    '-reinit_filter', '0',

    // 输入文件
    ...inputArgs,

    // 视频
    '-vf',
    [ 
      'scale_cuda=' + [
        `w='if(gt(iw,ih),min(iw,${VIDEO_TRANSFORM_MAX_WIDTH}),min(iw,${VIDEO_TRANSFORM_MAX_HEIGHT}))'`,
        `h='if(gt(iw,ih),min(ih,${VIDEO_TRANSFORM_MAX_HEIGHT}),min(ih,${VIDEO_TRANSFORM_MAX_WIDTH}))'`,
        'force_original_aspect_ratio=decrease',
        'format=nv12',
      ].join(':'),
      'hwupload=derive_device=cuda',
    ].join(','),
    
    '-c:v', 'h264_nvenc',
    '-b:v', '3000k',
    '-profile:v', 'high', '-level', '4.0',
    '-preset', 'p4',
    '-tune', 'll',
    '-bf', '0',
    '-gpu', 'any',

    // 音频
    "-c:a", "aac", '-b:a', '128k',
    
    // fmp4
    '-movflags', '+frag_keyframe+empty_moov+default_base_moof',

    // 输出
    '-f', 'mp4',
    'pipe:1',
  ];

  // 创建进程
  const ffmpegProcess = spawn('ffmpeg', args);
  // 保存进程信息
  setProcess(ffmpegProcess, hash);

  // logCommand('ffmpeg', args);

  // 设置响应头，告知客户端这是一个视频流
  ctx.set('Content-Type', 'video/mp4');
  ctx.set('Transfer-Encoding', 'chunked');

  // 错误处理
  ffmpegProcess.stderr.on('data', data => {
    logError(`${hash}: ffmpeg stream stderr error: ${data}`);
    logCommand('ffmpeg', args);
  });

  // 流开始
  ffmpegProcess.stdout.once('readable', () => {
    logWarn(`${hash}: ffmpeg stream process start`);
  });

  // 连接断开
  ctx.req.once('aborted', () => {
    logWarn(`${hash}: ffmpeg stream request aborted`);
    killProcess();
  });

  // 客户端请求关闭
  ctx.req.once('close', () => {
    logWarn(`${hash}: ffmpeg stream request close`);
  });

  // 客户端主动连接关闭
  ctx.req.socket.once('close', () => {
    logWarn(`${hash}: ffmpeg stream socket close`);
    killProcess();
  });

  ctx.req.socket.once('error', err => {
    if ((err as unknown as { code: string }).code === 'ECONNRESET') {
      logWarn(`${hash}: ffmpeg stream socket ECONNRESET`);
      ctx.req.socket.destroy();
    }
  });

  ctx.body = ffmpegProcess.stdout;
};
