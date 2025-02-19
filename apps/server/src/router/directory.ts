import { ApiResponseBase } from '#pkgs/shared';
import Router from '@koa/router';

const directoryRouter = new Router({ prefix: '/dir' });

directoryRouter.get('/tree', async ctx => {
  ctx.body = {
    error: 'this is not ok',
    msg: 'ok',
  };
});

export { directoryRouter };
