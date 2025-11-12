import postgres from 'postgres';

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL,
} = process.env;

export const sql = DATABASE_URL
  ? postgres(DATABASE_URL, { ssl: DB_SSL === 'true' })
  : postgres({
      host: DB_HOST,
      port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
      database: DB_NAME,
      username: DB_USER,
      password: DB_PASSWORD,
      ssl: DB_SSL === 'true',
    });