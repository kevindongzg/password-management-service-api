import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router({ prefix: '/api/v1' });

router.get('/health', (ctx: Context) => {
  ctx.status = 200;
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

export default router;