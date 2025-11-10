import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = new Koa();
  app.use(helmet());
  app.use(cors());
  app.use(compress());
  app.use(bodyParser());
  app.use(errorHandler);

  // Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  // 404 fallback
  app.use(async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: ctx.path,
    };
  });

  return app;
}