import {
  findUserByEmail,
  hasActiveReset,
  insertResetRequest,
  findResetRequest,
  executeResetTransaction,
} from '../../../repositories/passwordResetRepo';

jest.mock('../../../config/prisma', () => {
  const passwordResetRequest = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const user = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    user,
    passwordResetRequest,
    $transaction: jest.fn(async (ops: any[]) => {
      (prisma as any).__ops = ops;
    }),
  } as any;
  return { prisma };
});

const { prisma } = jest.requireMock('../../../config/prisma');

describe('passwordResetRepo', () => {
  beforeEach(() => {
    prisma.user.findUnique.mockReset();
    prisma.passwordResetRequest.findFirst.mockReset();
    prisma.passwordResetRequest.create.mockReset();
    prisma.passwordResetRequest.update.mockReset();
    prisma.user.update.mockReset();
    prisma.$transaction.mockClear();
    delete (prisma as any).__ops;
  });

  it('findUserByEmail returns user when present', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'user@example.com' });
    const user = await findUserByEmail('user@example.com');
    expect(user).toEqual({ id: 'u1', email: 'user@example.com' });
  });

  it('findUserByEmail returns null when absent', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const user = await findUserByEmail('missing@example.com');
    expect(user).toBeNull();
  });

  it('hasActiveReset returns true when rows exist', async () => {
    prisma.passwordResetRequest.findFirst.mockResolvedValueOnce({ id: 'r1' });
    const res = await hasActiveReset('user@example.com');
    expect(res).toBe(true);
  });

  it('hasActiveReset returns false when no rows', async () => {
    prisma.passwordResetRequest.findFirst.mockResolvedValueOnce(null);
    const res = await hasActiveReset('user@example.com');
    expect(res).toBe(false);
  });

  it('insertResetRequest passes values to prisma.create', async () => {
    prisma.passwordResetRequest.create.mockResolvedValueOnce({});
    const params = {
      id: 'r1',
      userId: 'u1',
      email: 'user@example.com',
      code: '123456',
      expiresAtIso: '2025-01-01T00:00:00.000Z',
    };
    await insertResetRequest(params);
    expect(prisma.passwordResetRequest.create).toHaveBeenCalledTimes(1);
    const arg = prisma.passwordResetRequest.create.mock.calls[0][0];
    expect(arg).toMatchObject({
      data: expect.objectContaining({ id: 'r1', userId: 'u1', email: 'user@example.com', code: '123456' }),
    });
  });

  it('findResetRequest returns request when present', async () => {
    const row = { id: 'r1', userId: 'u1', email: 'user@example.com', expires_at: new Date('2025-01-01T00:00:00.000Z'), used_at: null };
    prisma.passwordResetRequest.findFirst.mockResolvedValueOnce(row as any);
    const req = await findResetRequest('user@example.com', '123456');
    expect(req).toEqual({ id: 'r1', user_id: 'u1', email: 'user@example.com', expires_at: '2025-01-01T00:00:00.000Z', used_at: null });
  });

  it('findResetRequest returns null when absent', async () => {
    prisma.passwordResetRequest.findFirst.mockResolvedValueOnce(null);
    const req = await findResetRequest('user@example.com', 'bad');
    expect(req).toBeNull();
  });

  it('executeResetTransaction calls $transaction and performs two updates', async () => {
    await executeResetTransaction({ userId: 'u1', hash: 'hashed', requestId: 'r1' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const ops = (prisma as any).__ops;
    expect(Array.isArray(ops)).toBe(true);
    expect(ops.length).toBe(2);
  });
});