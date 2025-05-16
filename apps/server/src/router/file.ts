import {
  CACHE_DATA_PATH,
  CACHE_DATE_FILE_FULL_PATH,
  CACHE_DATE_FILE_NAME,
  POSTER_CACHE_MAX_AGE,
  POSTER_DIR_NAME,
  POSTER_FILE_EXT,
  POSTER_FILE_NAME_PREFIX,
  TEXT_FILE_SIZE_LIMIT,
} from '#/config';
import {
  readDataFromFile,
  readDataFromFileByMsgPack,
  writeDataToFileByMsgPack,
} from '#/util/fileOperation';
import {
  API_CONFIGS,
  ApiRequestDataTypes,
  ApiRequestParamsTypes,
  ApiResponseDataTypes,
  DirUpdateData,
} from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { findFileInfoInDir, logError, splitPath } from '#pkgs/tools/common';
import Router from '@koa/router';
import send from 'koa-send';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import trash from 'trash';
import { getRootDir, returnBody } from '../util/common';
import { sendFileWithRange } from '../util/range';
import { getTask } from '../util/task';

const updateTask = getTask('dirUpdate');

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

const deleteFileTask = getTask('deleteFile');

// 删除文件
fileRouter[API_CONFIGS.fileDelete.method](API_CONFIGS.fileDelete.url, async ctx => {
  const { files } = ctx.request.body as ApiRequestDataTypes<'fileDelete'>;
  if (!files?.length) throw new Error(ERROR_MSG.noFile);

  // 取内存缓存
  let cachedData = updateTask.getCache();
  if (!cachedData) {
    // 取本地缓存
    cachedData = (await readDataFromFileByMsgPack(
      path.join(CACHE_DATA_PATH, CACHE_DATE_FILE_NAME)
    )) as Omit<DirUpdateData, 'fileList'>;

    // 缓存到内存
    updateTask.setCache(cachedData);
  }

  const rootDirs = cachedData?.treeNode?.children;
  if (!rootDirs) throw new Error(ERROR_MSG.noFile);

  // debug
  ctx.body = returnBody();

  try {
    updateTask.start();
    for (const info of files) {
      // 根据入参，找到内存中对应的文件信息
      const base = getRootDir(info.basePathIndex);
      const pathSeq = splitPath(info.relativePath);
      const findRes = findFileInfoInDir(rootDirs[info.basePathIndex], pathSeq);
      if (!findRes) {
        logError(`no file info: "${info.relativePath}"`);
        continue;
      }
      const { fileInfo, parentDirInfo } = findRes;
      // 删除本地文件和缩略图，放入回收站
      const fullPath = path.join(base, fileInfo.relativePath);
      const posterPath = path.join(
        path.dirname(fullPath),
        POSTER_DIR_NAME,
        `${POSTER_FILE_NAME_PREFIX}${fileInfo.name}${POSTER_FILE_EXT}`
      );
      await trash([fullPath, posterPath]);
      // 删除并更新文件信息内存缓存
      const index = parentDirInfo.files.findIndex(it => it === fileInfo);
      parentDirInfo.files.splice(index, 1);
      // 更新文件信息缓存文件
      await writeDataToFileByMsgPack(CACHE_DATE_FILE_FULL_PATH, cachedData);
    }

    // done
    ctx.body = returnBody();
  } finally {
    updateTask.end();
  }
});

export { fileRouter };
