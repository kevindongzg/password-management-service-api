import { loadEnv } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import { createDatabaseConnection } from './config/database';

// Load env: prefer .env.local, then .env, else process env
const loadedEnvFile = loadEnv();

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
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

start();