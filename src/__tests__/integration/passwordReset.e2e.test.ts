import request from 'supertest';
import { Client } from 'pg';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Password Reset E2E', () => {
  // create unique user for this test run
  const unique = Date.now();
  const email = `e2e_user_${unique}@example.com`;
  const userId = `e2e-user-${unique}`;
  const dummyHash = '$2b$12$ZpWZkW2Ew3Q5bS9t9d8YyOkkQp7dCkM3yDqYyT3wLwV0GvCwA8kqG';
  const dbUrl = process.env.DATABASE_URL;
  let client: Client | null = null;

  beforeAll(async () => {
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set for integration test seeding.');
    }
    client = new Client({ connectionString: dbUrl });
    await client.connect();
    await client.query(
      `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [userId, email, dummyHash]
    );
  });

  afterAll(async () => {
    if (client) {
      try {
        await client.query('DELETE FROM users WHERE id=$1', [userId]);
      } catch {}
      await client.end();
      client = null;
    }
  });

  it('Initiate → Execute → Re-execute fails → Initiate again allowed', async () => {
    // 1) Initiate reset
    const initiateRes = await request(baseUrl)
      .post('/api/v1/password-reset/initiate')
      .send({ email })
      .expect(200);

    expect(initiateRes.body).toHaveProperty('resetId');
    expect(initiateRes.body).toHaveProperty('code');
    expect(initiateRes.body).toHaveProperty('expiresAt');

    const { code } = initiateRes.body;

    // 2) Execute reset
    const executeRes = await request(baseUrl)
      .post('/api/v1/password-reset/execute')
      .send({ email, code, newPassword: 'NewPass123!' })
      .expect(200);
    expect(executeRes.body).toMatchObject({ message: 'Password updated successfully' });

    // 3) Re-execute should fail (single-use)
    await request(baseUrl)
      .post('/api/v1/password-reset/execute')
      .send({ email, code, newPassword: 'AnotherPass123!' })
      .expect(400);

    // 4) Initiate again should be allowed (previous request used)
    await request(baseUrl)
      .post('/api/v1/password-reset/initiate')
      .send({ email })
      .expect(200);
  });

  it('Rejects invalid email', async () => {
    await request(baseUrl)
      .post('/api/v1/password-reset/initiate')
      .send({ email: 'invalid' })
      .expect(400);
  });
});
