import { Context, Next } from 'koa';
import { logger } from '../utils/logger';
import type { AppError } from '../types';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: unknown) {
    let status = 500;
    let message = 'Internal Server Error';

    if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object') {
      const e = err as Partial<AppError> & { message?: unknown };
      if (typeof e.status === 'number') status = e.status;
      if (typeof e.message === 'string') message = e.message;
    }

    const errorInfo = err instanceof Error ? { name: err.name, stack: err.stack } : undefined;

    logger.error('Request error', {
      status,
      message,
      method: ctx.method,
      url: ctx.url,
      correlation_id: ctx.state?.correlationId,
      ...(errorInfo ?? {}),
    });

    ctx.status = status;
    ctx.body = {
      error: status < 500 ? message : 'Internal Server Error',
      status,
      timestamp: new Date().toISOString(),
      path: ctx.path,
      correlationId: ctx.state?.correlationId,
    };
  }
}