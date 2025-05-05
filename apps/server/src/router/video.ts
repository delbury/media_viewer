import { API_CONFIGS, ApiRequestParamsTypes, ApiResponseDataTypes } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/common';
import Router from '@koa/router';
import path from 'node:path';
import { ERROR_MSG } from '../i18n/errorMsg';
import { getRootDir, returnBody, validateNumberString } from '../util/common';
import { getMediaDetail, transformVideoStream } from '../util/media';
import { transformSubtitleToVtt } from '../util/subtitle';

const videoRouter = new Router();

// 获取视频基本信息
videoRouter[API_CONFIGS.videoMetadata.method](API_CONFIGS.videoMetadata.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'videoMetadata'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notVideoFile);

  // 获取文件信息
  const fullMetadata = await getMediaDetail(fullPath, { showStreams: false });
  const fileInfo: ApiResponseDataTypes<'videoMetadata'> | null = fullMetadata
    ? {
        duration: +fullMetadata.format.duration,
        size: +fullMetadata.format.size,
        bitRate: +fullMetadata.format.bit_rate,
      }
    : null;
  ctx.body = returnBody(fileInfo);
});

// 视频文件转码并返回视频分片
videoRouter[API_CONFIGS.videoSegment.method](API_CONFIGS.videoSegment.url, async ctx => {
  const { basePathIndex, relativePath, start, duration } =
    ctx.query as ApiRequestParamsTypes<'videoSegment'>;

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
  if (fileType !== 'video') throw new Error(ERROR_MSG.notVideoFile);

  transformVideoStream(ctx, fullPath, { start: startNumber, duration: durationNumber });
});

// 视频文件的降级地址，转码并返回视频流
videoRouter[API_CONFIGS.videoFallback.method](API_CONFIGS.videoFallback.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'videoFallback'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notVideoFile);

  transformVideoStream(ctx, fullPath);
});

// 返回视频的字幕文件，转换并返回 vtt 格式
videoRouter[API_CONFIGS.videoSubtitle.method](API_CONFIGS.videoSubtitle.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'videoSubtitle'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  await transformSubtitleToVtt(ctx, fullPath);
});

export { videoRouter };
