import { CACHE_DATE_FILE_FULL_PATH, DIRECTORY_ROOTS, SERVER_VERSION } from '#/config';
import { returnBody } from '#/util/common';
import { readDataFromFileByMsgPack, writeDataToFileByMsgPack } from '#/util/fileOperation';
import { API_CONFIGS, ApiResponseDataTypes, DirUpdateData } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { traverseDirectories } from '#pkgs/tools/traverseDirectories';
import Router from '@koa/router';
import { omit } from 'lodash-es';
import { getTask } from '../util/task';

const directoryRouter = new Router();

const updateTask = getTask('dirUpdate');

// 强制更新，返回文件夹 tree 和 文件 list
directoryRouter[API_CONFIGS.dirUpdate.method](API_CONFIGS.dirUpdate.url, async ctx => {
  if (!DIRECTORY_ROOTS) throw new Error(ERROR_MSG.noRootDir);

  try {
    updateTask.start();
    const res = await traverseDirectories(DIRECTORY_ROOTS, { version: SERVER_VERSION });
    const resultData = omit(res, ['fileList']);
    ctx.body = returnBody(resultData);
    // 更新内存缓存
    updateTask.setCache(resultData);
    // 更新本地缓存
    await writeDataToFileByMsgPack(CACHE_DATE_FILE_FULL_PATH, res);
  } finally {
    updateTask.end();
  }
});

// 返回文件树
directoryRouter[API_CONFIGS.dirTree.method](API_CONFIGS.dirTree.url, async ctx => {
  // 优先取内存缓存
  const cache = updateTask.getCache();
  if (cache) {
    ctx.body = returnBody<ApiResponseDataTypes<'dirTree'>>(cache.treeNode);
    return;
  }
  // 取本地缓存
  const json = (await readDataFromFileByMsgPack(CACHE_DATE_FILE_FULL_PATH)) as Omit<
    DirUpdateData,
    'fileList'
  >;

  // 缓存到内存
  updateTask.setCache(json);
  ctx.body = returnBody<ApiResponseDataTypes<'dirTree'>>(json.treeNode ?? null);
});

export { directoryRouter };
