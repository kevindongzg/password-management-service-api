import { initiatePasswordReset } from '../../services/passwordResetService';

jest.mock('../../config/sql', () => {
  const sql = jest.fn();
  return { sql };
});

const { sql } = jest.requireMock('../../config/sql');

describe('initiatePasswordReset', () => {
  beforeEach(() => {
    sql.mockReset();
  });

  it('rejects invalid email', async () => {
    await expect(initiatePasswordReset('invalid'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when user not found', async () => {
    sql.mockResolvedValueOnce([]);

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when active request exists', async () => {
    sql
      .mockResolvedValueOnce([{ id: 'u1', email: 'user@example.com' }])
      .mockResolvedValueOnce([{ id: 'r1' }]);

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 429 });
  });

  it('creates reset request and returns code + expiresAt', async () => {
    sql
      .mockResolvedValueOnce([{ id: 'u1', email: 'user@example.com' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({});

    const res = await initiatePasswordReset('user@example.com');
    expect(res.resetId).toBeTruthy();
    expect(res.code).toMatch(/^\d{6}$/);
    expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});