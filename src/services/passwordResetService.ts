import { getDatabasePool } from '../config/database';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import type { PasswordResetInitiateResponse, PasswordResetExecuteResponse } from '../types/passwordReset';

const RESET_TTL_MINUTES = 30;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function initiatePasswordReset(email: string): Promise<PasswordResetInitiateResponse> {
  if (!validator.isEmail(email, { allow_utf8_local_part: true, require_tld: true })) {
    const err: any = new Error('Invalid email');
    err.status = 400;
    throw err;
  }

  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT id, email FROM users WHERE email=$1', [email]);
    if (userRes.rowCount === 0) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const user = userRes.rows[0];

    const activeRes = await client.query(
      'SELECT id FROM password_reset_requests WHERE email=$1 AND used_at IS NULL AND expires_at > NOW()',
      [email]
    );
    if ((activeRes.rowCount ?? 0) > 0) {
      const err: any = new Error('An active reset request already exists');
      err.status = 429;
      throw err;
    }

    const id = uuidv4();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

    await client.query(
      'INSERT INTO password_reset_requests (id, user_id, email, code, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [id, user.id, email, code, expiresAt.toISOString()]
    );

    logger.info('Password reset initiated', { email });
    return { resetId: id, code, expiresAt: expiresAt.toISOString() };
  } finally {
    client.release();
  }
}

export async function executePasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<PasswordResetExecuteResponse> {
  if (!validator.isEmail(email, { allow_utf8_local_part: true, require_tld: true })) {
    const err: any = new Error('Invalid email');
    err.status = 400;
    throw err;
  }
  if (!newPassword || newPassword.length < 8) {
    const err: any = new Error('Invalid password');
    err.status = 400;
    throw err;
  }

  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    const reqRes = await client.query(
      'SELECT id, user_id, email, expires_at, used_at FROM password_reset_requests WHERE email=$1 AND code=$2',
      [email, code]
    );
    if (reqRes.rowCount === 0) {
      const err: any = new Error('Reset request not found');
      err.status = 404;
      throw err;
    }
    const req = reqRes.rows[0];
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

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hash = await bcrypt.hash(newPassword, rounds);

    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user_id]);
    await client.query('UPDATE password_reset_requests SET used_at=NOW() WHERE id=$1', [req.id]);
    await client.query('COMMIT');

    logger.info('Password reset executed', { email });
    return { message: 'Password updated successfully' };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    throw e;
  } finally {
    client.release();
  }
}