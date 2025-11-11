import { loadEnv } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import { createDatabaseConnection } from './config/database';

loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // init db
    await createDatabaseConnection();
    const app = createApp();

    app.listen(PORT, HOST, () => {
      logger.info(`Server listening on http://${HOST}:${PORT}`);
    });
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