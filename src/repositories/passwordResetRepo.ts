import { sql } from '../config/sql';

export interface UserRow {
  id: string;
  email: string;
}

export interface ResetRequestRow {
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await sql<UserRow[]>`SELECT id, email FROM users WHERE email=${email}`;
  return rows[0] ?? null;
}

export async function hasActiveReset(email: string): Promise<boolean> {
  const rows = await sql`SELECT 1 FROM password_reset_requests WHERE email=${email} AND used_at IS NULL AND expires_at > NOW() LIMIT 1`;
  return rows.length > 0;
}

export async function insertResetRequest(params: {
  id: string;
  userId: string;
  email: string;
  code: string;
  expiresAtIso: string;
}): Promise<void> {
  const { id, userId, email, code, expiresAtIso } = params;
  await sql`INSERT INTO password_reset_requests (id, user_id, email, code, expires_at) VALUES (${id}, ${userId}, ${email}, ${code}, ${expiresAtIso})`;
}

export async function findResetRequest(email: string, code: string): Promise<ResetRequestRow | null> {
  const rows = await sql<ResetRequestRow[]>`SELECT id, user_id, email, expires_at, used_at FROM password_reset_requests WHERE email=${email} AND code=${code}`;
  return rows[0] ?? null;
}

export async function executeResetTransaction(params: {
  userId: string;
  hash: string;
  requestId: string;
}): Promise<void> {
  const { userId, hash, requestId } = params;
  await sql.begin(async (tx) => {
    await tx`UPDATE users SET password_hash=${hash}, updated_at=NOW() WHERE id=${userId}`;
    await tx`UPDATE password_reset_requests SET used_at=NOW() WHERE id=${requestId}`;
  });
}