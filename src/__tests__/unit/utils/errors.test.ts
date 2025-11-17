import { ValidationError, NotFoundError, isHttpError } from '../../../utils/errors';

describe('utils/errors', () => {
  it('ValidationError sets status, code and details', () => {
    const err = new ValidationError({ a: 1 });
    expect(err.message).toBe('Validation error');
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual({ a: 1 });
  });

  it('NotFoundError sets status and optional code', () => {
    const err = new NotFoundError('Oops', 'NOT_FOUND');
    expect(err.message).toBe('Oops');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('isHttpError matches HttpError instances only', () => {
    const e = new ValidationError();
    expect(isHttpError(e)).toBe(true);
    expect(isHttpError(new Error('x'))).toBe(false);
    expect(isHttpError({ message: 'y' })).toBe(false);
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError(undefined)).toBe(false);
  });
});