import { executePasswordReset } from '../../services/passwordResetService';

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

jest.mock('../../repositories/passwordResetRepo', () => ({
  findResetRequest: jest.fn(),
  executeResetTransaction: jest.fn(),
}));

const repo = jest.requireMock('../../repositories/passwordResetRepo');

describe('executePasswordReset', () => {
  beforeEach(() => {
    repo.findResetRequest.mockReset();
    repo.executeResetTransaction.mockReset();
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
    repo.findResetRequest.mockResolvedValueOnce(null);
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when request already used', async () => {
    repo.findResetRequest.mockResolvedValueOnce({ id: 'r1', user_id: 'u1', used_at: new Date().toISOString(), expires_at: new Date(Date.now() + 60000).toISOString(), email: 'user@example.com' });
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when request expired', async () => {
    repo.findResetRequest.mockResolvedValueOnce({ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() - 60000).toISOString(), email: 'user@example.com' });
    await expect(executePasswordReset('user@example.com', '123456', 'NewPass123!'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('updates password and marks request used on success', async () => {
    // select request
    repo.findResetRequest.mockResolvedValueOnce({ id: 'r1', user_id: 'u1', used_at: null, expires_at: new Date(Date.now() + 60000).toISOString(), email: 'user@example.com' });
    repo.executeResetTransaction.mockResolvedValueOnce(undefined);

    const res = await executePasswordReset('user@example.com', '123456', 'NewPass123!');
    expect(res).toEqual({ message: 'Password updated successfully' });
    expect(repo.executeResetTransaction).toHaveBeenCalledTimes(1);
  });
});