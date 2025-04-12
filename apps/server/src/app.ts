import { logInfo } from '#pkgs/tools/common';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { directoryRouter } from './router/directory';
import { fileRouter } from './router/file';
import { returnError } from './util/common';

const routers = [directoryRouter, fileRouter];

const PORT = 4002;

const app = new Koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // logError(err);
    ctx.status = 400;
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
