import type { Context, Next } from 'koa';
import { logger } from '../utils/logger';

export async function accessLog(ctx: Context, next: Next) {
  const start = Date.now();
  try {
    await next();
  } finally {
    const duration_ms = Date.now() - start;
    logger.info('http_access', {
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      duration_ms,
    });
  }
}