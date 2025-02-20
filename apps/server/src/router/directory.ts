import { returnBody, returnError } from '#/util';
import { traverseDirectories } from '#pkgs/tools/traverseDirectories';
import Router from '@koa/router';

const directoryRouter = new Router({ prefix: '/dir' });

// 返回文件夹 tree 和 文件 list
let isUpdating = false;

directoryRouter.get('/update', async ctx => {
  if (isUpdating) {
    ctx.body = returnError('still updating');
    return;
  }

  const rootDir = process.env.API_DIRECTORY_ROOT;
  if (!rootDir) {
    ctx.body = returnError('no root dir');
    return;
  }

  try {
    isUpdating = true;
    const res = await traverseDirectories(rootDir);
    ctx.body = returnBody(res);
  } finally {
    isUpdating = false;
  }
});

export { directoryRouter };
