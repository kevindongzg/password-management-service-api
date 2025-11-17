import type { UserRow, ResetRequestRow } from '../types';
import { prisma } from '../config/prisma';

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  return user ? { id: user.id, email: user.email } : null;
}

export async function hasActiveReset(email: string): Promise<boolean> {
  const found = await prisma.passwordResetRequest.findFirst({
    where: { email, used_at: null, expires_at: { gt: new Date() } },
    select: { id: true },
  });
  return !!found;
}

export async function insertResetRequest(params: {
  id: string;
  userId: string;
  email: string;
  code: string;
  expiresAtIso: string;
}): Promise<void> {
  const { id, userId, email, code, expiresAtIso } = params;
  await prisma.passwordResetRequest.create({
    data: {
      id,
      userId,
      email,
      code,
      expires_at: new Date(expiresAtIso),
    },
  });
}

export async function findResetRequest(email: string, code: string): Promise<ResetRequestRow | null> {
  const row = await prisma.passwordResetRequest.findFirst({
    where: { email, code },
    select: { id: true, userId: true, email: true, expires_at: true, used_at: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.userId,
    email: row.email,
    expires_at: row.expires_at.toISOString(),
    used_at: row.used_at ? row.used_at.toISOString() : null,
  };
}

export async function executeResetTransaction(params: {
  userId: string;
  hash: string;
  requestId: string;
}): Promise<void> {
  const { userId, hash, requestId } = params;
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password_hash: hash, updated_at: new Date() } }),
    prisma.passwordResetRequest.update({ where: { id: requestId }, data: { used_at: new Date() } }),
  ]);
}