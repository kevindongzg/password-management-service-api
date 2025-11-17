import { controller, post } from '../framework/decorator';
import type { Context } from 'koa';
import { initiatePasswordReset, executePasswordReset } from '../services/passwordResetService';
import type { PasswordResetInitiateRequest, PasswordResetInitiateResponse, PasswordResetExecuteRequest, PasswordResetExecuteResponse } from '../types';
import { parseOrThrow, initiateSchema, executeSchema } from '../utils/validation';
import { logger } from '../utils/logger';

@controller('/password-reset')
export class PasswordResetController {
  @post('/initiate')
  async initiate(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetInitiateRequest>;
    const data = parseOrThrow<PasswordResetInitiateRequest>(initiateSchema, body);
    logger.info('Password reset initiate validated', { email: data.email, correlation_id: ctx.state?.correlationId });
    const result: PasswordResetInitiateResponse = await initiatePasswordReset(data.email, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
    logger.info('Password reset initiate responded', { email: data.email, correlation_id: ctx.state?.correlationId, status: ctx.status });
  }

  @post('/execute')
  async execute(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetExecuteRequest>;
    const data = parseOrThrow<PasswordResetExecuteRequest>(executeSchema, body);
    logger.info('Password reset execute validated', { email: data.email, correlation_id: ctx.state?.correlationId });
    const result: PasswordResetExecuteResponse = await executePasswordReset(data.email, data.code, data.newPassword, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
    logger.info('Password reset execute responded', { email: data.email, correlation_id: ctx.state?.correlationId, status: ctx.status });
  }
}