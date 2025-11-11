import request from 'supertest';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Health E2E (real app)', () => {
  it('GET /api/v1/health returns ok from running server', async () => {
    const res = await request(baseUrl).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(typeof res.body.timestamp).toBe('string');
  });
});