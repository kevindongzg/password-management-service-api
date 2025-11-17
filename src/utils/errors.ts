export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    if (code) this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export class ValidationError extends HttpError {
  constructor(details?: unknown) {
    super('Validation error', 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 404, code, details);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 400, code, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 429, code, details);
  }
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}