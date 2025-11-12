import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import { Route } from './framework/decorator';
import { resolve } from 'path';
import { errorHandler } from './middleware/errorHandler';
import { accessLog } from './middleware/accessLog';
import { correlationId } from './middleware/correlationId';

export function createApp() {
  const app = new Koa();
  app.use(helmet());
  app.use(cors());
  app.use(compress());
  app.use(bodyParser());
  app.use(correlationId);
  app.use(accessLog);
  app.use(errorHandler);

  // Routes
  const route = new Route(app, resolve(__dirname, 'controllers'), '/api/v1');
  route.init();

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