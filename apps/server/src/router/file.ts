import { POSTER_CACHE_MAX_AGE, TEXT_FILE_SIZE_LIMIT } from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes, ApiResponseDataTypes } from '#pkgs/apis';
import { readDataFromFile } from '#pkgs/tools/fileOperation';
import Router from '@koa/router';
import send from 'koa-send';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { ERROR_MSG } from '../i18n/errorMsg';
import { getRootDir, returnBody } from '../util/common';
import { sendFileWithRange } from '../util/range';

const fileRouter = new Router();

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
