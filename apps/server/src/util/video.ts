import { MediaDetailInfo } from '#pkgs/shared/index.js';
import { logError, logWarn } from '#pkgs/tools/common.js';
import { ParameterizedContext } from 'koa';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { execCommand } from './common';

interface VideoDetailTasks {
  [key: string]: {
    done: boolean;
    data?: MediaDetailInfo;
    promise?: Promise<MediaDetailInfo>;
  };
}

const VIDEO_DETAIL_TASKS: VideoDetailTasks = {};

// 获取视频详细信息
export const getVideoDetail = async (filaPath: string, forceUpdate = false) => {
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
          '-show_streams -show_format',
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

// 转码处理视频流
export const transforVideoStream = async (ctx: ParameterizedContext, filePath: string) => {
  const hash = createHash('md5').update(filePath).digest('hex').substring(0, 8);

  // 转码命令
  /* prettier-ignore */
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-hwaccel', 'cuda',
    '-i', `${filePath}`,
    // '-movflags', '+faststart',
    '-movflags', '+faststart+frag_keyframe',
    '-preset', 'fast',
    '-tune', 'zerolatency',
    '-c:v', 'libx264',
    "-c:a", "aac",
    '-f', 'mp4',
    'pipe:1',
  ];

  // 关闭之前的进程
  killProcess();
  // 创建进程
  const ffmpegProcess = spawn('ffmpeg', args);
  // 保存进程信息
  setProcess(ffmpegProcess, hash);

  // 设置响应头，告知客户端这是一个视频流
  ctx.set('Content-Type', 'video/mp4');
  ctx.set('Transfer-Encoding', 'chunked');

  // 错误处理
  ffmpegProcess.stdout.on('error', err => {
    logError(`${hash}: ffmpeg stream error:`, err);
  });

  // 流开始
  ffmpegProcess.stdout.once('readable', () => {
    logWarn(`${hash}: ffmpeg stream start`);
  });

  // 连接断开
  ctx.req.once('aborted', () => {
    logWarn(`${hash}: ffmpeg stream aborted`);
    killProcess();
  });

  // 客户端主动关闭
  ctx.req.once('close', () => {
    logWarn(`${hash}: ffmpeg stream close`);
  });

  ctx.req.socket.once('error', err => {
    if ((err as unknown as { code: string }).code === 'ECONNRESET') {
      logWarn(`${hash}: ffmpeg socket ECONNRESET`);
      ctx.req.socket.destroy();
    }
  });

  ctx.body = ffmpegProcess.stdout;
};
