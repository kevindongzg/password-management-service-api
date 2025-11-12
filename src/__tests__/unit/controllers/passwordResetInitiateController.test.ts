import request from 'supertest';
import { createApp } from '../../../app';

jest.mock('../../../services/passwordResetService', () => ({
  initiatePasswordReset: jest.fn().mockResolvedValue({
    resetId: 'test-reset-id',
    code: '123456',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }),
}));

describe('PasswordResetController', () => {
  it('POST /api/v1/password-reset/initiate returns reset info', async () => {
    const app = createApp();
    const server = app.callback();
    const res = await request(server)
      .post('/api/v1/password-reset/initiate')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      resetId: 'test-reset-id',
      code: '123456',
    });
  });
});