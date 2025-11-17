import { logger } from '../utils/logger';
import { prisma } from './prisma';

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
}