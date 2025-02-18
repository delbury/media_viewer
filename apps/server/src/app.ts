import Koa from 'koa';
import { directoryRouter } from './router/directory';

const routers = [directoryRouter];

const PORT = 4002;

const app = new Koa();

for (const r of routers) {
  app.use(r.routes());
  app.use(r.allowedMethods());
}

app.listen(PORT, () => {
  console.info(`server started on ${PORT}`);
});
