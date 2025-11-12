export type ApiErrorResponse = {
  error: string;
  status: number;
  timestamp: string;
  path: string;
};

export interface AppError extends Error {
  status?: number;
  details?: unknown;
}