import request from 'supertest';
import { createApp } from '../../app';

jest.mock('../../services/passwordResetService', () => ({
  executePasswordReset: jest.fn().mockResolvedValue({
    message: 'Password updated successfully',
  }),
}));

describe('PasswordResetController execute', () => {
  it('POST /api/v1/password-reset/execute updates password', async () => {
    const app = createApp();
    const server = app.callback();
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: '123456', newPassword: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Password updated successfully' });
  });
});