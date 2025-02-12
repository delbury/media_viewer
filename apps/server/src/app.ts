import Koa from 'koa';
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(4002, () => {
  console.log('server started');
});
