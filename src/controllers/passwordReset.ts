import { controller, post } from '../framework/decorator';
import type { Context } from 'koa';
import { initiatePasswordReset, executePasswordReset } from '../services/passwordResetService';
import type { PasswordResetInitiateRequest, PasswordResetInitiateResponse, PasswordResetExecuteRequest, PasswordResetExecuteResponse } from '../types';
import { validateInitiate, validateExecute } from '../utils/validation';
import { makeAppError } from '../utils/errors';

@controller('/password-reset')
export class PasswordResetController {
  @post('/initiate')
  async initiate(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetInitiateRequest>;
    const parsed = validateInitiate(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      throw makeAppError('Validation error', 400, 'VALIDATION_ERROR', details);
    }
    const result: PasswordResetInitiateResponse = await initiatePasswordReset(parsed.data.email, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }

  @post('/execute')
  async execute(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetExecuteRequest>;
    const parsed = validateExecute(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      throw makeAppError('Validation error', 400, 'VALIDATION_ERROR', details);
    }
    const result: PasswordResetExecuteResponse = await executePasswordReset(parsed.data.email, parsed.data.code, parsed.data.newPassword, ctx.state?.correlationId);
    ctx.status = 200;
    ctx.body = result;
  }
}