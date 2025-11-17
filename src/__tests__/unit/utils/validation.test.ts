import { normalizeString, validateInitiate, validateExecute } from '../../../utils/validation';

describe('validation normalizeString', () => {
  it('trims spaces', () => {
    expect(normalizeString('  abc  ')).toBe('abc');
  });
  it('handles null and undefined', () => {
    expect(normalizeString(null as any)).toBe('');
    expect(normalizeString(undefined as any)).toBe('');
  });
});

describe('validation schemas', () => {
  it('validateInitiate accepts valid email', () => {
    const r = validateInitiate({ email: 'user@example.com' });
    expect(r.success).toBe(true);
  });
  it('validateInitiate rejects invalid email', () => {
    const r = validateInitiate({ email: 'invalid' });
    expect(r.success).toBe(false);
  });
  it('validateExecute accepts valid payload', () => {
    const r = validateExecute({ email: 'user@example.com', code: '123456', newPassword: 'NewPass123!' });
    expect(r.success).toBe(true);
  });
  it('validateExecute rejects bad code', () => {
    const r = validateExecute({ email: 'user@example.com', code: 'abc123', newPassword: 'NewPass123!' });
    expect(r.success).toBe(false);
  });
  it('validateExecute rejects short password', () => {
    const r = validateExecute({ email: 'user@example.com', code: '123456', newPassword: 'short' });
    expect(r.success).toBe(false);
  });
});
