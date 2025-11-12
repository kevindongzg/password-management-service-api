import request from 'supertest';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Correlation ID E2E', () => {
  it('returns x-correlation-id header and matches response body correlationId on error', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/password-reset/initiate')
      .set('x-correlation-id', 'e2e-corr-123')
      .send({ email: 'invalid' })
      .expect(400);

    const headerCorr = res.headers['x-correlation-id'];
    expect(headerCorr).toBeTruthy();
    expect(headerCorr).toBe('e2e-corr-123');
    expect(res.body).toHaveProperty('correlationId', 'e2e-corr-123');
  });
});