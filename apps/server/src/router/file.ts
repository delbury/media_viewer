import { DIRECTORY_ROOTS, RAW_IMAGE_FOR_POSTER_MAX_SIZE } from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/common';
import Router from '@koa/router';
import send from 'koa-send';
import { stat } from 'node:fs/promises';
import path from 'node:path';
const fileRouter = new Router();

fileRouter[API_CONFIGS.filePoster.method](API_CONFIGS.filePoster.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'filePoster'>;

  // 参数校验
  const basePath = DIRECTORY_ROOTS[basePathIndex];
  if (!basePath) throw new Error('no root dir');

  const fileType = detectFileType(relativePath);
  if (fileType !== 'image') throw new Error('not an image file');

  const fullPath = path.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error('error path');

  // 文件大小校验
  const fileStat = await stat(fullPath);
  if (fileStat.size > RAW_IMAGE_FOR_POSTER_MAX_SIZE) {
    console.log('file too large', fileStat.size);
    // 读已有的缩略图
    // 无缩略图，则创建
  }

  await send(ctx, relativePath, { root: basePath });
});

export { fileRouter };
