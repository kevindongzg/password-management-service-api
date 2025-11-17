import request from 'supertest';
import { createApp } from '../../../app';

jest.mock('../../../services/passwordResetService', () => ({
  executePasswordReset: jest.fn().mockResolvedValue({
    message: 'Password updated successfully',
  }),
}));

describe('PasswordResetController execute', () => {
  const app = createApp();
  const server = app.callback();

  it('POST /api/v1/password-reset/execute updates password', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: '123456', newPassword: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Password updated successfully' });
  });

  it('rejects invalid email', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'invalid', code: '123456', newPassword: 'NewPass123!' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });

  it('rejects invalid code format', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: 'abc123', newPassword: 'NewPass123!' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: '123456', newPassword: 'short' });
    expect(res.status).toBe(400);
  });
});
