import { executePasswordReset } from '../../services/passwordResetService';

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

jest.mock('../../config/sql', () => {
  const sql: any = jest.fn();
  sql.begin = jest.fn(async (cb: any) => {
    const tx = jest.fn();
    await cb(tx);
  });
  return { sql };
});

const { sql } = jest.requireMock('../../config/sql');

describe('executePasswordReset', () => {
  beforeEach(() => {
    sql.mockReset();
    sql.begin.mockClear();
  });

  it('rejects invalid email', async () => {
    await expect(executePasswordReset('invalid', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects invalid password', async () => {
    await expect(executePasswordReset('user@example.com', '123456', 'short'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when request not found', async () => {
    sql.mockResolvedValueOnce([]);
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when request already used', async () => {
    sql.mockResolvedValueOnce([{ id: 'r1', user_id: 'u1', used_at: new Date().toISOString(), expires_at: new Date(Date.now() + 60000).toISOString() }]);
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when request expired', async () => {
    sql.mockResolvedValueOnce([{ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() - 60000).toISOString() }]);
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('updates password and marks request used on success', async () => {
    // select request
    sql.mockResolvedValueOnce([{ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() + 60000).toISOString() }]);

    const res = await executePasswordReset('user@example.com', '123456', 'NewPass123!');
    expect(res).toEqual({ message: 'Password updated successfully' });
    expect(sql.begin).toHaveBeenCalledTimes(1);
  });
});