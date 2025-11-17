import { connectDatabase } from '../../../config/database';

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../config/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(async () => [{ now: new Date().toISOString() }]),
  },
}));

const { prisma } = jest.requireMock('../../../config/prisma');
const { logger } = jest.requireMock('../../../utils/logger');

describe('connectDatabase', () => {
  beforeEach(() => {
    prisma.$queryRaw.mockReset();
    logger.info.mockReset();
    logger.error.mockReset();
  });

  it('logs success when connection works', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ now: new Date().toISOString() }]);
    await connectDatabase();
    expect(logger.info).toHaveBeenCalledWith('Database connected');
  });

  it('logs error and throws when connection fails', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('failed'));
    await expect(connectDatabase()).rejects.toBeTruthy();
    expect(logger.error).toHaveBeenCalled();
  });
});