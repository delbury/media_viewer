import { MediaDetailInfo } from '#pkgs/shared/index.js';
import { logError, logWarn } from '#pkgs/tools/common.js';
import { ParameterizedContext } from 'koa';
import { spawn } from 'node:child_process';
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
            const info = JSON.parse(stdout);
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

// 转码处理视频流
export const transforVideoStream = async (ctx: ParameterizedContext, filePath: string) => {
  // 转码命令
  /* prettier-ignore */
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', `${filePath}`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-tune', 'zerolatency',
    '-f', 'mp4',
    '-movflags', 'frag_keyframe+empty_moov',
    'pipe:1',
  ];

  const ffmpegProcess = spawn('ffmpeg', args);

  // 设置响应头，告知客户端这是一个视频流
  ctx.set('Content-Type', 'video/mp4');
  ctx.set('Transfer-Encoding', 'chunked');

  // 错误处理
  ffmpegProcess.stderr.on('data', data => {
    logError(`ffmpeg stderr: ${data}`);
  });
  ffmpegProcess.on('error', err => {
    logError(`ffmpeg error:`, err);
  });

  ctx.req.on('close', () => {
    ffmpegProcess.kill('SIGTERM');
    logWarn('ffmpeg stream closed');
  });

  ctx.body = ffmpegProcess.stdout;
};
