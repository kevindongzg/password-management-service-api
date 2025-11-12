import { controller, post } from '../framework/decorator';
import type { Context } from 'koa';
import { initiatePasswordReset, executePasswordReset } from '../services/passwordResetService';
import type { PasswordResetInitiateRequest, PasswordResetInitiateResponse, PasswordResetExecuteRequest, PasswordResetExecuteResponse } from '../types';
import { normalizeString } from '../utils/validation';

@controller('/password-reset')
export class PasswordResetController {
  @post('/initiate')
  async initiate(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetInitiateRequest>;
    const email = normalizeString(body.email);
    const result: PasswordResetInitiateResponse = await initiatePasswordReset(email, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }

  @post('/execute')
  async execute(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetExecuteRequest>;
    const email = normalizeString(body.email);
    const code = normalizeString(body.code);
    const result: PasswordResetExecuteResponse = await executePasswordReset(email, code, body.newPassword, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }
}