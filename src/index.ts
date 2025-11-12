import { loadEnv } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { sql } from './config/sql';

loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await connectDatabase();
    const app = createApp();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server listening on http://${HOST}:${PORT}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        try {
          await sql.end({ timeout: 5 });
          logger.info('Database connections closed');
        } catch (e) {
          logger.error('Error closing database connections', { e });
        } finally {
          process.exit(0);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to start server', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    process.exit(1);
  }
}

start();