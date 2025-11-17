import { z } from 'zod';
import { PasswordResetExecuteRequest, PasswordResetInitiateRequest } from '../types';

export function normalizeString(value: string | null | undefined): string {
  return (value ?? '').trim();
}

export const initiateSchema = z.object({
  email: z.string().email(),
});

export const executeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
});

export function validateInitiate(payload: Partial<PasswordResetInitiateRequest>) {
  const normalized = { email: normalizeString(payload.email) };
  return initiateSchema.safeParse(normalized);
}

export function validateExecute(payload: Partial<PasswordResetExecuteRequest>) {
  const normalized = {
    email: normalizeString(payload.email),
    code: normalizeString(payload.code),
    newPassword: payload.newPassword,
  };
  return executeSchema.safeParse(normalized);
}