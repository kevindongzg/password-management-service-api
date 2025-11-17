import { findUserByEmail, hasActiveReset, insertResetRequest, findResetRequest, executeResetTransaction } from '../repositories/passwordResetRepo';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { PasswordResetInitiateResponse, PasswordResetExecuteResponse } from '../types';

import { RESET_TTL_MINUTES, BCRYPT_ROUNDS } from '../config/constants';
import { NotFoundError, TooManyRequestsError, BadRequestError } from '../utils/errors';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function initiatePasswordReset(email: string, correlationId?: string): Promise<PasswordResetInitiateResponse> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const active = await hasActiveReset(email);
  if (active) {
    throw new TooManyRequestsError('An active reset request already exists', 'ACTIVE_RESET_EXISTS');
  }

  const id = uuidv4();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

  await insertResetRequest({ id, userId: user.id, email, code, expiresAtIso: expiresAt.toISOString() });

  logger.info('Password reset initiated', { email, correlation_id: correlationId });
  return { resetId: id, code, expiresAt: expiresAt.toISOString() };
}

export async function executePasswordReset(
  email: string,
  code: string,
  newPassword: string,
  correlationId?: string
): Promise<PasswordResetExecuteResponse> {

  const req = await findResetRequest(email, code);
  if (!req) {
    throw new NotFoundError('Reset request not found', 'REQUEST_NOT_FOUND');
  }
  if (req.used_at) {
    throw new BadRequestError('Reset request already used', 'REQUEST_ALREADY_USED');
  }
  if (new Date(req.expires_at).getTime() < Date.now()) {
    throw new BadRequestError('Reset request expired', 'REQUEST_EXPIRED');
  }

  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await executeResetTransaction({ userId: req.user_id, hash, requestId: req.id });

  logger.info('Password reset executed', { email, correlation_id: correlationId });
  return { message: 'Password updated successfully' };
}