import { controller, post } from '../framework/decorator';
import type { Context } from 'koa';
import { initiatePasswordReset, executePasswordReset } from '../services/passwordResetService';
import type { PasswordResetInitiateRequest, PasswordResetInitiateResponse, PasswordResetExecuteRequest, PasswordResetExecuteResponse } from '../types';

@controller('/password-reset')
export class PasswordResetController {
  @post('/initiate')
  async initiate(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetInitiateRequest>;
    const email: string = body.email ?? '';
    const result: PasswordResetInitiateResponse = await initiatePasswordReset(email);
    ctx.status = 200;
    ctx.body = result;
  }

  @post('/execute')
  async execute(ctx: Context): Promise<void> {
    const body = (ctx.request.body ?? {}) as Partial<PasswordResetExecuteRequest>;
    const email: string = body.email ?? '';
    const code: string = body.code ?? '';
    const newPassword: string = body.newPassword ?? '';
    const result: PasswordResetExecuteResponse = await executePasswordReset(email, code, newPassword);
    ctx.status = 200;
    ctx.body = result;
  }
}