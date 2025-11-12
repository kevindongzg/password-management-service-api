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
  : (() => {
      const opts: any = { ssl: DB_SSL === 'true' };
      if (DB_HOST) opts.host = DB_HOST;
      opts.port = DB_PORT ? parseInt(DB_PORT, 10) : 5432;
      if (DB_NAME) opts.database = DB_NAME;
      if (DB_USER) opts.username = DB_USER;
      if (DB_PASSWORD) opts.password = DB_PASSWORD;
      return postgres(opts);
    })();