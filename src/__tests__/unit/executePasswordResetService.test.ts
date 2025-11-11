import { executePasswordReset } from '../../services/passwordResetService';

jest.mock('../../config/database', () => {
  const client = {
    query: jest.fn(),
    release: jest.fn(),
  } as any;
  return {
    getDatabasePool: () => ({
      connect: async () => client,
    }),
    __client: client,
  };
});

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

const { __client: dbClient } = jest.requireMock('../../config/database');

describe('executePasswordReset', () => {
  beforeEach(() => {
    dbClient.query.mockReset();
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
    dbClient.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when request already used', async () => {
    dbClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'r1', user_id: 'u1', used_at: new Date().toISOString(), expires_at: new Date(Date.now() + 60000).toISOString() }] });
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when request expired', async () => {
    dbClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() - 60000).toISOString() }] });
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('updates password and marks request used on success', async () => {
    dbClient.query
      // select request
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() + 60000).toISOString() }] })
      // BEGIN
      .mockResolvedValueOnce({})
      // UPDATE users
      .mockResolvedValueOnce({})
      // UPDATE password_reset_requests
      .mockResolvedValueOnce({})
      // COMMIT
      .mockResolvedValueOnce({});

    const res = await executePasswordReset('user@example.com', '123456', 'NewPass123!');
    expect(res).toEqual({ message: 'Password updated successfully' });
  });
});