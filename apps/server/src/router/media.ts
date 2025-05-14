import { API_CONFIGS, ApiRequestParamsTypes } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { detectFileType, isMediaFile } from '#pkgs/tools/common';
import Router from '@koa/router';
import { omit } from 'lodash-es';
import path from 'node:path';
import { getRootDir, returnBody } from '../util/common';
import { getMediaDetail } from '../util/media';

const mediaRouter = new Router();

// 获取媒体文件的基本信息
mediaRouter[API_CONFIGS.mediaMetadata.method](API_CONFIGS.mediaMetadata.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'mediaMetadata'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (!isMediaFile(fileType)) throw new Error(ERROR_MSG.notMediaFile);

  // 获取文件信息
  const fullMetadata = await getMediaDetail(fullPath);
  const fileInfo = omit(fullMetadata, ['format.filename']) ?? null;
  ctx.body = returnBody(fileInfo);
});

export { mediaRouter };
