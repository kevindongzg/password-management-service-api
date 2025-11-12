import type { AppError } from '../types';

export function makeAppError(message: string, status: number, code?: string, details?: unknown): AppError {
  const err = new Error(message) as AppError;
  err.status = status;
  if (code) err.code = code;
  if (details !== undefined) err.details = details;
  return err;
}

export function isAppError(e: unknown): e is AppError {
  return !!e && typeof e === 'object' && 'message' in (e as any);
}