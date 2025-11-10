import { Context, Next } from 'koa';
import { logger } from '../utils/logger';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Internal Server Error';

    logger.error('Request error', {
      status,
      message,
      method: ctx.method,
      url: ctx.url,
    });

    ctx.status = status;
    ctx.body = {
      error: status < 500 ? message : 'Internal Server Error',
      status,
      timestamp: new Date().toISOString(),
      path: ctx.path,
    };
  }
}