import { CACHE_DATA_PATH, CACHE_DATE_FILE_NAME, DIRECTORY_ROOTS, SERVER_VERSION } from '#/config';
import { returnBody } from '#/util/common';
import { API_CONFIGS, ApiResponseDataTypes } from '#pkgs/apis';
import { readDataFromFile, writeDataToFile } from '#pkgs/tools/fileOperation';
import { traverseDirectories } from '#pkgs/tools/traverseDirectories';
import Router from '@koa/router';
import { omit } from 'lodash-es';
import { ERROR_MSG } from '../i18n/errorMsg';
import { getTask } from '../util/task';

const directoryRouter = new Router();

const updateTask = getTask('dirUpdate');

// 强制更新，返回文件夹 tree 和 文件 list
directoryRouter[API_CONFIGS.dirUpdate.method](API_CONFIGS.dirUpdate.url, async ctx => {
  if (updateTask.loading) throw new Error(ERROR_MSG.taskInProgress);

  if (!DIRECTORY_ROOTS) throw new Error(ERROR_MSG.noRootDir);

  try {
    updateTask.loading = true;
    const res = await traverseDirectories(DIRECTORY_ROOTS, { version: SERVER_VERSION });
    const resultData = omit(res, ['fileList']);
    ctx.body = returnBody(resultData);
    // 更新内存缓存
    updateTask.cache = resultData;
    // 更新本地缓存
    await writeDataToFile(CACHE_DATA_PATH, CACHE_DATE_FILE_NAME, res);
  } finally {
    updateTask.loading = false;
  }
});

// 返回文件树
directoryRouter[API_CONFIGS.dirTree.method](API_CONFIGS.dirTree.url, async ctx => {
  // 优先取内存缓存
  if (updateTask.cache) {
    ctx.body = returnBody<ApiResponseDataTypes<'dirTree'>>(updateTask.cache.treeNode);
    return;
  }
  // 取本地缓存
  const json = await readDataFromFile(CACHE_DATA_PATH, CACHE_DATE_FILE_NAME);
  // 缓存到内存
  updateTask.cache = json;
  ctx.body = returnBody(updateTask.cache?.treeNode ?? null);
});

export { directoryRouter };
