import request from 'supertest';
import { createApp } from '../../../app';

describe('Health endpoint', () => {
  it('GET /api/v1/health returns ok', async () => {
    const app = createApp();
    const server = app.callback();
    const res = await request(server).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});