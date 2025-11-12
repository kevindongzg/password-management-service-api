import { makeAppError, isAppError } from '../../../utils/errors';

describe('utils/errors', () => {
  it('makeAppError sets status and code and details', () => {
    const err = makeAppError('Oops', 418, 'TEAPOT', { a: 1 });
    expect(err.message).toBe('Oops');
    expect(err.status).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.details).toEqual({ a: 1 });
  });

  it('isAppError matches Error-like objects', () => {
    const e = new Error('x');
    expect(isAppError(e)).toBe(true);
    expect(isAppError({ message: 'y' })).toBe(true);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});