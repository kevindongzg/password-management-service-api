import request from 'supertest';
import { createApp } from '../../../app';

describe('App 404 fallback', () => {
  it('returns Not Found with path', async () => {
    const app = createApp();
    const server = app.callback();
    const res = await request(server).get('/not-found-path');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Not Found', path: '/not-found-path' });
  });
});