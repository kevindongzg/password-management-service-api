import { initiateSchema, executeSchema } from '../../../utils/validation';

describe('validation schemas', () => {
  it('validateInitiate accepts valid email', () => {
    const r = initiateSchema.safeParse({ email: 'user@example.com' });
    expect(r.success).toBe(true);
  });

  it('validateInitiate rejects invalid email', () => {
    const r = initiateSchema.safeParse({ email: 'invalid' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some(i => i.path.join('.') === 'email' && i.message === 'Invalid email')).toBe(true);
    }
  });

  it('validateExecute accepts valid payload', () => {
    const r = executeSchema.safeParse({ email: 'user@example.com', code: '123456', newPassword: 'NewPass123!' });
    expect(r.success).toBe(true);
  });

  it('validateExecute rejects bad code', () => {
    const r = executeSchema.safeParse({ email: 'user@example.com', code: 'abc123', newPassword: 'NewPass123!' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some(i => i.path.join('.') === 'code' && i.message === 'Invalid code format')).toBe(true);
    }
  });

  it('validateExecute rejects short password', () => {
    const r = executeSchema.safeParse({ email: 'user@example.com', code: '123456', newPassword: 'short' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some(i => i.path.join('.') === 'newPassword' && i.message === 'Password too short')).toBe(true);
    }
  });
  
  it('validateExecute reports missing fields', () => {
    const r1 = executeSchema.safeParse({ code: '123456', newPassword: 'NewPass123!' });
    expect(r1.success).toBe(false);
    if (!r1.success) {
      expect(r1.error.issues.some(i => i.path.join('.') === 'email' && i.message === 'Missing email')).toBe(true);
    }
    const r2 = executeSchema.safeParse({ email: 'user@example.com', newPassword: 'NewPass123!' });
    expect(r2.success).toBe(false);
    if (!r2.success) {
      expect(r2.error.issues.some(i => i.path.join('.') === 'code' && i.message === 'Missing code')).toBe(true);
    }
    const r3 = executeSchema.safeParse({ email: 'user@example.com', code: '123456' });
    expect(r3.success).toBe(false);
    if (!r3.success) {
      expect(r3.error.issues.some(i => i.path.join('.') === 'newPassword' && i.message === 'Missing newPassword')).toBe(true);
    }
  });
});
