import { DIRECTORY_ROOTS, POSTER_CACHE_MAX_AGE, RAW_IMAGE_FOR_POSTER_MAX_SIZE } from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/common';
import Router from '@koa/router';
import send from 'koa-send';
import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { generatePoster, getPosterFilePath } from '../util';

const fileRouter = new Router();

fileRouter[API_CONFIGS.filePoster.method](API_CONFIGS.filePoster.url, async ctx => {
  const { basePathIndex, relativePath, force } = ctx.query as ApiRequestParamsTypes<'filePoster'>;

  // 强制更新
  const forceUpdate = force === 'true';

  // 参数校验
  const basePath = DIRECTORY_ROOTS[basePathIndex];
  if (!basePath) throw new Error('no root dir');

  const fileType = detectFileType(relativePath);
  if (fileType !== 'image') throw new Error('not an image file');

  const fullPath = path.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error('error path');

  let sendFileRelativePath = relativePath;

  // 文件大小校验
  const fileStat = await stat(fullPath);
  if (fileStat.size > RAW_IMAGE_FOR_POSTER_MAX_SIZE) {
    let hasPoster = false;
    const relativePosterFilePath = getPosterFilePath(relativePath);
    const fullPosterFilePath = path.join(basePath, relativePosterFilePath);

    if (!forceUpdate) {
      try {
        // 判断缩略图是否存在
        await access(fullPosterFilePath);
        hasPoster = true;
      } catch {
        //
      }
    }

    if (hasPoster) {
      // 有缩略图，则读取
      sendFileRelativePath = relativePosterFilePath;
    } else {
      // 无缩略图，则创建
      await generatePoster(fullPath, fullPosterFilePath);
      sendFileRelativePath = relativePosterFilePath;
    }
  }

  await send(ctx, sendFileRelativePath, {
    root: basePath,
    maxAge: POSTER_CACHE_MAX_AGE,
    hidden: true,
  });
});

export { fileRouter };
