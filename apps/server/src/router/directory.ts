import { returnBody, returnError } from '#/util';
import { writeDataToFile } from '#pkgs/tools/fileOperation';
import { traverseDirectories, TraverseDirectoriesReturnValue } from '#pkgs/tools/traverseDirectories';
import Router from '@koa/router';
import path from 'node:path';

const DIRECTORY_ROOT = process.env.API_DIRECTORY_ROOT;
const CACHE_DATA_PATH = path.resolve(__dirname, process.env.CACHE_DATA_PATH || './');

const directoryRouter = new Router({ prefix: '/dir' });

// 更新任务
const updateTask: {
  loading: boolean;
  cache?: TraverseDirectoriesReturnValue;
  localCacheFileName: string;
} = {
  loading: false,
  cache: null,
  localCacheFileName: 'full_dir_info.local.json',
};

// 强制更新，返回文件夹 tree 和 文件 list
directoryRouter.get('/update', async ctx => {
  if (updateTask.loading) {
    ctx.body = returnError('still updating');
    return;
  }

  const rootDir = DIRECTORY_ROOT;
  if (!rootDir) {
    ctx.body = returnError('no root dir');
    return;
  }

  try {
    updateTask.loading = true;
    const res = await traverseDirectories(rootDir);
    ctx.body = returnBody(res);
    // 更新内存缓存
    updateTask.cache = res;
    // 更新本地缓存
    await writeDataToFile(CACHE_DATA_PATH, updateTask.localCacheFileName, res);
  } finally {
    updateTask.loading = false;
  }
});

export { directoryRouter };
