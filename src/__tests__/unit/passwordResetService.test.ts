import { initiatePasswordReset } from '../../services/passwordResetService';

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

const { __client: dbClient } = jest.requireMock('../../config/database');

describe('initiatePasswordReset', () => {
  beforeEach(() => {
    dbClient.query.mockReset();
  });

  it('rejects invalid email', async () => {
    await expect(initiatePasswordReset('invalid'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when user not found', async () => {
    dbClient.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when active request exists', async () => {
    dbClient.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'u1', email: 'user@example.com' }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'r1' }] });

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 429 });
  });

  it('creates reset request and returns code + expiresAt', async () => {
    dbClient.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'u1', email: 'user@example.com' }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({});

    const res = await initiatePasswordReset('user@example.com');
    expect(res.resetId).toBeTruthy();
    expect(res.code).toMatch(/^\d{6}$/);
    expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});