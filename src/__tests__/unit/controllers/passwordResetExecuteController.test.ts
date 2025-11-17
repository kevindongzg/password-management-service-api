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
    expect(res.body.details?.some((d: any) => d.path === 'email' && d.message === 'Invalid email')).toBe(true);
  });

  it('rejects missing email', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ code: '123456', newPassword: 'NewPass123!' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'email' && d.message === 'Missing email')).toBe(true);
  });

  it('rejects invalid code format', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: 'abc123', newPassword: 'NewPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'code' && d.message === 'Invalid code format')).toBe(true);
  });

  it('rejects short password', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: '123456', newPassword: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'newPassword' && d.message === 'Password too short')).toBe(true);
  });

  it('rejects missing code', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', newPassword: 'NewPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'code' && d.message === 'Missing code')).toBe(true);
  });

  it('rejects missing newPassword', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/execute')
      .send({ email: 'user@example.com', code: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'newPassword' && d.message === 'Missing newPassword')).toBe(true);
  });
});
