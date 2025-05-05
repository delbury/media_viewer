import { ApiResponseDataTypes } from '#pkgs/apis/index.js';
import { logError, logSuccess } from '#pkgs/tools/common.js';
import { readDataFromFile } from '#pkgs/tools/fileOperation.js';
import { ParameterizedContext } from 'koa';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { getFilePathHash, returnBody } from './common';

const VTT_EXT = '.vtt';

const MAX_VTT_CACHE_LENGTH = 5;
const VTT_CACHE = new Map<string, Promise<string> | string>();

export const transformSubtitleToVtt = async (ctx: ParameterizedContext, filePath: string) => {
  const curExt = path.extname(filePath);
  const cachePromise = VTT_CACHE.get(filePath);
  let content = '';

  if (curExt === VTT_EXT) {
    // 无须转换，直接返回
    content = (await readDataFromFile(filePath)) ?? '';
  } else if (cachePromise) {
    // 有缓存，直接返回
    content = await cachePromise;
    // 更新缓存优先级
    VTT_CACHE.delete(filePath);
    VTT_CACHE.set(filePath, cachePromise);
  } else {
    // 无缓存，转换后返回
    /* prettier-ignore */
    const args = [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', `${filePath}`,
      '-c:s', 'webvtt',
      '-f', 'webvtt',
      '-'
    ];

    const promise = new Promise<string>((resolve, reject) => {
      const progress = spawn('ffmpeg', args);
      let tempData = '';

      // 监听 stdout 数据
      progress.stdout.on('data', data => {
        tempData += data;
      });

      progress.stderr.on('data', data => {
        logError(`transform vtt error: ${data}`);
        reject(data);
      });

      // 监听进程结束
      progress.on('close', code => {
        if (code === 0) {
          const hash = getFilePathHash(filePath);
          logSuccess(`${hash}: transform vtt subtitle successfully`);
          resolve(tempData);
        } else {
          logError('transform vtt subtitle failed: ', code);
          reject(code);
        }
      });
    });

    // 缓存满了，则删除
    if (VTT_CACHE.size >= MAX_VTT_CACHE_LENGTH)
      VTT_CACHE.delete(VTT_CACHE.keys().next().value as string);

    // 设置缓存
    VTT_CACHE.set(filePath, promise);
    promise
      .then(res => {
        VTT_CACHE.set(filePath, res);
      })
      .catch(() => {
        VTT_CACHE.delete(filePath);
      });
    content = await promise;
  }

  ctx.body = returnBody<ApiResponseDataTypes<'videoSubtitle'>>({ content });
};
