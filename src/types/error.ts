export interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
  path: string;
  correlationId?: string | undefined;
  details?: unknown | undefined;
}