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
  const app = createApp();
  const server = app.callback();
  
  it('POST /api/v1/password-reset/initiate returns reset info', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/initiate')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      resetId: 'test-reset-id',
      code: '123456',
    });
  });

  it('rejects invalid email with 400 and validation details', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/initiate')
      .send({ email: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'email' && d.message === 'Invalid email')).toBe(true);
  });

  it('rejects missing email', async () => {
    const res = await request(server)
      .post('/api/v1/password-reset/initiate')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.details?.some((d: any) => d.path === 'email' && d.message === 'Missing email')).toBe(true);
  });
});
