import { controller, post } from '../framework/decorator';
import type { Context } from 'koa';
import { initiatePasswordReset, executePasswordReset } from '../services/passwordResetService';
import type { PasswordResetInitiateRequest, PasswordResetInitiateResponse, PasswordResetExecuteRequest, PasswordResetExecuteResponse } from '../types';
import { parseOrThrow, initiateSchema, executeSchema } from '../utils/validation';

@controller('/password-reset')
export class PasswordResetController {
  @post('/initiate')
  async initiate(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetInitiateRequest>;
    const data = parseOrThrow<PasswordResetInitiateRequest>(initiateSchema, body);
    const result: PasswordResetInitiateResponse = await initiatePasswordReset(data.email, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }

  @post('/execute')
  async execute(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetExecuteRequest>;
    const data = parseOrThrow<PasswordResetExecuteRequest>(executeSchema, body);
    const result: PasswordResetExecuteResponse = await executePasswordReset(data.email, data.code, data.newPassword, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }
}