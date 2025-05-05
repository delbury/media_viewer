import { DIRECTORY_ROOTS, POSTER_CACHE_MAX_AGE, TEXT_FILE_SIZE_LIMIT } from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes, ApiResponseDataTypes } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/common';
import { readDataFromFile } from '#pkgs/tools/fileOperation';
import Router from '@koa/router';
import send from 'koa-send';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { ERROR_MSG } from '../i18n/errorMsg';
import { returnBody, validateNumberString } from '../util/common';
import { sendFileWithRange } from '../util/range';
import { getTask } from '../util/task';
import { getVideoDetail, transformVideoStream } from '../util/video';

const fileRouter = new Router();
const clearPosterTask = getTask('clearPoster');
const getRootDir = (index: number | string) => {
  const basePath = DIRECTORY_ROOTS?.[+index];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  return basePath;
};

// 获取视频基本信息
fileRouter[API_CONFIGS.fileVideoMetadata.method](API_CONFIGS.fileVideoMetadata.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileVideoMetadata'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notAnVideoFile);

  // 获取文件信息
  const fullMetadata = await getVideoDetail(fullPath, { showStreams: false });
  const fileInfo: ApiResponseDataTypes<'fileVideoMetadata'> | null = fullMetadata
    ? {
        duration: +fullMetadata.format.duration,
        size: +fullMetadata.format.size,
        bitRate: +fullMetadata.format.bit_rate,
      }
    : null;
  ctx.body = returnBody(fileInfo);
});

// 视频文件转码并返回视频分片
fileRouter[API_CONFIGS.fileVideoSegment.method](API_CONFIGS.fileVideoSegment.url, async ctx => {
  const { basePathIndex, relativePath, start, duration } =
    ctx.query as ApiRequestParamsTypes<'fileVideoSegment'>;

  // 参数校验
  const startNumber = validateNumberString(start);
  const durationNumber = validateNumberString(duration);

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notAnVideoFile);

  transformVideoStream(ctx, fullPath, { start: startNumber, duration: durationNumber });
});

// 视频文件的降级地址，转码并返回视频流
fileRouter[API_CONFIGS.fileVideoFallback.method](API_CONFIGS.fileVideoFallback.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileVideoFallback'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notAnVideoFile);

  transformVideoStream(ctx, fullPath);
});

// 返回文件的文本内容
fileRouter[API_CONFIGS.fileText.method](API_CONFIGS.fileText.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileText'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  const fileInfo = await stat(fullPath);
  if (fileInfo.size > TEXT_FILE_SIZE_LIMIT) throw new Error(ERROR_MSG.sizeLimited);

  const content = (await readDataFromFile(fullPath)) ?? '';

  ctx.body = returnBody<ApiResponseDataTypes<'fileText'>>({ content });
});

// 返回文件
fileRouter[API_CONFIGS.fileGet.method](API_CONFIGS.fileGet.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileGet'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 处理带 Range 头的请求
  const useRange = await sendFileWithRange(ctx, fullPath);

  // 没有 Range
  if (useRange === false) {
    await send(ctx, relativePath, {
      root: basePath,
      maxAge: POSTER_CACHE_MAX_AGE,
      hidden: false,
    });
  }
});

export { fileRouter };
