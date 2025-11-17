import { Context, Next } from 'koa';
import { logger } from '../utils/logger';
import { isHttpError } from '../utils/errors';
import type { ErrorResponse } from '../types';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: unknown) {
    let status = 500;
    let message = 'Internal Server Error';
    let code: string | undefined;

    if (isHttpError(err)) {
      if (typeof err.status === 'number') status = err.status;
      if (typeof err.message === 'string') message = err.message;
      code = err.code;
    } else if (typeof err === 'string') {
      message = err;
    } else if (err instanceof Error) {
      if (typeof err.message === 'string') message = err.message;
    }

    const errorInfo = err instanceof Error ? { name: err.name, stack: err.stack } : undefined;

    logger.error('Request error', {
      status,
      message,
      ...(code ? { code } : {}),
      method: ctx.method,
      url: ctx.url,
      correlation_id: ctx.state?.correlationId,
      ...(errorInfo ?? {}),
    });

    ctx.status = status;
    const response: ErrorResponse = {
      error: status < 500 ? message : 'Internal Server Error',
      status,
      timestamp: new Date().toISOString(),
      path: ctx.path,
      correlationId: ctx.state?.correlationId,
      ...(isHttpError(err) && err.details !== undefined ? { details: err.details } : {}),
    };
    ctx.body = response;
  }
}