export type ApiErrorResponse = {
  error: string;
  status: number;
  timestamp: string;
  path: string;
  correlationId?: string;
};

export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}