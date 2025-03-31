import { CACHE_DATA_PATH, CACHE_DATE_FILE_NAME, DIRECTORY_ROOTS, SERVER_VERSION } from '#/config';
import { returnBody } from '#/util';
import { API_CONFIGS, ApiResponseDataTypes } from '#pkgs/apis';
import { DirUpdateData } from '#pkgs/shared';
import { readDataFromFile, writeDataToFile } from '#pkgs/tools/fileOperation';
import { traverseDirectories } from '#pkgs/tools/traverseDirectories';
import Router from '@koa/router';

const directoryRouter = new Router();

// 更新任务
const updateTask: {
  loading: boolean;
  cache?: DirUpdateData;
} = {
  loading: false,
  cache: null,
};

// 强制更新，返回文件夹 tree 和 文件 list
directoryRouter[API_CONFIGS.dirUpdate.method](API_CONFIGS.dirUpdate.url, async ctx => {
  if (updateTask.loading) throw new Error('still updating');

  if (!DIRECTORY_ROOTS) throw new Error('no root dir');

  try {
    updateTask.loading = true;
    const res = await traverseDirectories(DIRECTORY_ROOTS, { version: SERVER_VERSION });
    ctx.body = returnBody<ApiResponseDataTypes<'dirUpdate'>>({
      treeNode: res.treeNode,
      version: res.version,
      timestamp: res.timestamp,
    });
    // 更新内存缓存
    updateTask.cache = res;
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
