import { getDatabasePool } from '../config/database';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import type { PasswordResetInitiateResponse } from '../types/passwordReset';

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