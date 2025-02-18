import Router from '@koa/router';

const directoryRouter = new Router({ prefix: '/dir' });

directoryRouter.get('/tree', async ctx => {
  ctx.status = 400;
  ctx.body = {
    error: 'this is not ok',
    msg: 'ok',
  };
});

export { directoryRouter };
