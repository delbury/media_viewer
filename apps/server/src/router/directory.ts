import { DIRECTORY_ROOTS, SERVER_VERSION } from '#/config';
import { returnBody } from '#/util/common';
import { API_CONFIGS, ApiResponseDataTypes } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import Router from '@koa/router';
import { omit } from 'lodash-es';
import { asyncVideoFileDurationTask } from '../util/duration';
import { getTask } from '../util/task';
import { traverseDirectories } from '../util/traverseDirectories';

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
    await updateTask.saveCache();

    // 获取视频文件的时长信息
    asyncVideoFileDurationTask(res.fileList);
  } finally {
    updateTask.end();
  }
});

// 返回文件树
directoryRouter[API_CONFIGS.dirTree.method](API_CONFIGS.dirTree.url, async ctx => {
  const cache = await updateTask.getCache();
  ctx.body = returnBody<ApiResponseDataTypes<'dirTree'>>(cache?.treeNode);
});

export { directoryRouter };
