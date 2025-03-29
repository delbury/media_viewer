import { DIRECTORY_ROOTS } from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/utils';
import Router from '@koa/router';
import send from 'koa-send';
const fileRouter = new Router();

fileRouter[API_CONFIGS.filePoster.method](API_CONFIGS.filePoster.url, async ctx => {
  const { basePathIndex, fullPath } = ctx.query as ApiRequestParamsTypes<'filePoster'>;

  const basePath = DIRECTORY_ROOTS[basePathIndex];
  if (!basePath) throw new Error('no root dir');

  const fileType = detectFileType(fullPath);
  if (fileType !== 'image') throw new Error('not an image file');
  if (fileType.includes('..')) throw new Error('error path');

  await send(ctx, fullPath, { root: basePath });
});

export { fileRouter };
