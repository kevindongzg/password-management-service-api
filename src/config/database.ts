import { logger } from '../utils/logger';
import { sql } from './sql';

export async function connectDatabase(): Promise<void> {
  try {
    await sql`SELECT NOW()`;
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
}