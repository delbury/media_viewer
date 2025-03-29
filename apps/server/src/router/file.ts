import { API_CONFIGS } from '#pkgs/apis';
import Router from '@koa/router';

const fileRouter = new Router();

fileRouter[API_CONFIGS.filePoster.method](API_CONFIGS.filePoster.url, async ctx => {
  const { path } = ctx.query;
});

export default { fileRouter };
