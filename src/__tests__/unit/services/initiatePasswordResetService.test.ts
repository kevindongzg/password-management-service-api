import { initiatePasswordReset } from '../../../services/passwordResetService';

jest.mock('../../../repositories/passwordResetRepo', () => ({
  findUserByEmail: jest.fn(),
  hasActiveReset: jest.fn(),
  insertResetRequest: jest.fn(),
}));

const repo = jest.requireMock('../../../repositories/passwordResetRepo');

describe('initiatePasswordReset', () => {
  beforeEach(() => {
    repo.findUserByEmail.mockReset();
    repo.hasActiveReset.mockReset();
    repo.insertResetRequest.mockReset();
  });

  it('rejects invalid email', async () => {
    await expect(initiatePasswordReset('invalid'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejects when user not found', async () => {
    repo.findUserByEmail.mockResolvedValueOnce(null);

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('rejects when active request exists', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({ id: 'u1', email: 'user@example.com' });
    repo.hasActiveReset.mockResolvedValueOnce(true);

    await expect(initiatePasswordReset('user@example.com'))
      .rejects.toMatchObject({ status: 429 });
  });

  it('creates reset request and returns code + expiresAt', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({ id: 'u1', email: 'user@example.com' });
    repo.hasActiveReset.mockResolvedValueOnce(false);
    repo.insertResetRequest.mockResolvedValueOnce(undefined);

    const res = await initiatePasswordReset('user@example.com');
    expect(res.resetId).toBeTruthy();
    expect(res.code).toMatch(/^\d{6}$/);
    expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});