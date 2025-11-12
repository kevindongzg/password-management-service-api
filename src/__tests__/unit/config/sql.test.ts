describe('config/sql', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses DATABASE_URL with ssl true', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db';
    process.env.DB_SSL = 'true';

    jest.mock('postgres', () => {
      const fn = jest.fn(() => ({}));
      return { __esModule: true, default: fn };
    });

    const pg = require('postgres').default;
    jest.isolateModules(() => {
      const { sql } = require('../../../config/sql');
      expect(sql).toBeDefined();
    });

    expect(pg).toHaveBeenCalledWith('postgres://user:pass@host:5432/db', { ssl: true });
  });

  it('builds options from discrete envs with default port', () => {
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = 'db-host';
    process.env.DB_NAME = 'db-name';
    process.env.DB_USER = 'db-user';
    process.env.DB_PASSWORD = 'db-pass';
    process.env.DB_SSL = 'false';

    jest.mock('postgres', () => {
      const fn = jest.fn(() => ({}));
      return { __esModule: true, default: fn };
    });

    const pg = require('postgres').default;
    jest.isolateModules(() => {
      const { sql } = require('../../../config/sql');
      expect(sql).toBeDefined();
    });

    const call = pg.mock.calls[0];
    expect(typeof call[0]).toBe('object');
    expect(call[0]).toMatchObject({ host: 'db-host', database: 'db-name', username: 'db-user', password: 'db-pass', ssl: false });
    expect(call[0].port).toBe(5432);
  });
});