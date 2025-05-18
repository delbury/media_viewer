import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { logError, logInfo } from '#pkgs/tools/common';
import { REQUEST_TIMEOUT } from '#pkgs/tools/constant';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { directoryRouter } from './router/directory';
import { fileRouter } from './router/file';
import { mediaRouter } from './router/media';
import { posterRouter } from './router/poster';
import { videoRouter } from './router/video';
import { returnError } from './util/common';

const routers = [directoryRouter, fileRouter, posterRouter, videoRouter, mediaRouter];

const PORT = process.env.PORT || 4002;

const app = new Koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logError(err);
    ctx.status = 400;
    ctx.body = returnError((err as Error)?.message || ERROR_MSG.serverError);
  }
});

for (const r of routers) {
  app.use(r.routes());
  app.use(r.allowedMethods());
}

app.on('error', err => {
  logError(err);
});

const server = app.listen(PORT, () => {
  logInfo(`server started on ${PORT}`);
});

server.timeout = REQUEST_TIMEOUT;
