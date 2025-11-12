import {
  findUserByEmail,
  hasActiveReset,
  insertResetRequest,
  findResetRequest,
  executeResetTransaction,
} from '../../repositories/passwordResetRepo';

jest.mock('../../config/sql', () => {
  const sql: any = jest.fn();
  sql.begin = jest.fn(async (cb: any) => {
    const tx: any = jest.fn();
    sql.__tx = tx;
    await cb(tx);
  });
  return { sql };
});

const { sql } = jest.requireMock('../../config/sql');

describe('passwordResetRepo', () => {
  beforeEach(() => {
    sql.mockReset();
    sql.begin.mockClear();
    delete (sql as any).__tx;
  });

  it('findUserByEmail returns user when present', async () => {
    sql.mockResolvedValueOnce([{ id: 'u1', email: 'user@example.com' }]);
    const user = await findUserByEmail('user@example.com');
    expect(user).toEqual({ id: 'u1', email: 'user@example.com' });
  });

  it('findUserByEmail returns null when absent', async () => {
    sql.mockResolvedValueOnce([]);
    const user = await findUserByEmail('missing@example.com');
    expect(user).toBeNull();
  });

  it('hasActiveReset returns true when rows exist', async () => {
    sql.mockResolvedValueOnce([{ id: 'r1' }]);
    const res = await hasActiveReset('user@example.com');
    expect(res).toBe(true);
  });

  it('hasActiveReset returns false when no rows', async () => {
    sql.mockResolvedValueOnce([]);
    const res = await hasActiveReset('user@example.com');
    expect(res).toBe(false);
  });

  it('insertResetRequest passes values to sql tag', async () => {
    sql.mockResolvedValueOnce({});
    const params = {
      id: 'r1',
      userId: 'u1',
      email: 'user@example.com',
      code: '123456',
      expiresAtIso: '2025-01-01T00:00:00.000Z',
    };
    await insertResetRequest(params);
    expect(sql).toHaveBeenCalledTimes(1);
    const call = sql.mock.calls[0];

    expect(Array.isArray(call[0])).toBe(true);
    expect(call[1]).toBe('r1');
    expect(call[2]).toBe('u1');
    expect(call[3]).toBe('user@example.com');
    expect(call[4]).toBe('123456');
    expect(call[5]).toBe('2025-01-01T00:00:00.000Z');
  });

  it('findResetRequest returns request when present', async () => {
    const row = { id: 'r1', user_id: 'u1', email: 'user@example.com', expires_at: '2025-01-01T00:00:00.000Z', used_at: null };
    sql.mockResolvedValueOnce([row]);
    const req = await findResetRequest('user@example.com', '123456');
    expect(req).toEqual(row);
  });

  it('findResetRequest returns null when absent', async () => {
    sql.mockResolvedValueOnce([]);
    const req = await findResetRequest('user@example.com', 'bad');
    expect(req).toBeNull();
  });

  it('executeResetTransaction calls begin and performs two updates', async () => {
    await executeResetTransaction({ userId: 'u1', hash: 'hashed', requestId: 'r1' });
    expect(sql.begin).toHaveBeenCalledTimes(1);
    const tx = (sql as any).__tx;
    expect(tx).toBeDefined();
    expect(tx).toHaveBeenCalledTimes(2);
  });
});