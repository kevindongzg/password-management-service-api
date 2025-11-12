import { findUserByEmail, hasActiveReset, insertResetRequest, findResetRequest, executeResetTransaction } from '../repositories/passwordResetRepo';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import type { PasswordResetInitiateResponse, PasswordResetExecuteResponse } from '../types';

const RESET_TTL_MINUTES = 30;
const EMAIL_VALIDATION_OPTS = { allow_utf8_local_part: true, require_tld: true } as const;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function initiatePasswordReset(email: string): Promise<PasswordResetInitiateResponse> {
  if (!validator.isEmail(email, EMAIL_VALIDATION_OPTS)) {
    const err: any = new Error('Invalid email');
    err.status = 400;
    throw err;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const active = await hasActiveReset(email);
  if (active) {
    const err: any = new Error('An active reset request already exists');
    err.status = 429;
    throw err;
  }

  const id = uuidv4();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

  await insertResetRequest({ id, userId: user.id, email, code, expiresAtIso: expiresAt.toISOString() });

  logger.info('Password reset initiated', { email });
  return { resetId: id, code, expiresAt: expiresAt.toISOString() };
}

export async function executePasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<PasswordResetExecuteResponse> {
  if (!validator.isEmail(email, EMAIL_VALIDATION_OPTS)) {
    const err: any = new Error('Invalid email');
    err.status = 400;
    throw err;
  }
  if (!newPassword || newPassword.length < 8) {
    const err: any = new Error('Invalid password');
    err.status = 400;
    throw err;
  }

  const req = await findResetRequest(email, code);
  if (!req) {
    const err: any = new Error('Reset request not found');
    err.status = 404;
    throw err;
  }
  if (req.used_at) {
    const err: any = new Error('Reset request already used');
    err.status = 400;
    throw err;
  }
  if (new Date(req.expires_at).getTime() < Date.now()) {
    const err: any = new Error('Reset request expired');
    err.status = 400;
    throw err;
  }

  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await executeResetTransaction({ userId: req.user_id, hash, requestId: req.id });

  logger.info('Password reset executed', { email });
  return { message: 'Password updated successfully' };
}