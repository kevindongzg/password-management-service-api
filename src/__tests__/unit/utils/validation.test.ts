import { normalizeString } from '../../../utils/validation';

describe('validation normalizeString', () => {
  it('trims spaces', () => {
    expect(normalizeString('  abc  ')).toBe('abc');
  });
  it('handles null and undefined', () => {
    expect(normalizeString(null as any)).toBe('');
    expect(normalizeString(undefined as any)).toBe('');
  });
});