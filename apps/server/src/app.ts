import { logInfo } from '#pkgs/tools/utils.js';
import Koa from 'koa';
import { directoryRouter } from './router/directory';
import { fileRouter } from './router/file';
import { returnError } from './util';

const routers = [directoryRouter, fileRouter];

const PORT = 4002;

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.body = returnError(err.message);
  }
});

for (const r of routers) {
  app.use(r.routes());
  app.use(r.allowedMethods());
}

app.listen(PORT, () => {
  logInfo(`server started on ${PORT}`);
});
