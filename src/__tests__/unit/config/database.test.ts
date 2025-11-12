import { connectDatabase } from '../../../config/database';

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../config/sql', () => ({
  sql: jest.fn(async () => [{ now: new Date().toISOString() }]),
}));

const { sql } = jest.requireMock('../../../config/sql');
const { logger } = jest.requireMock('../../../utils/logger');

describe('connectDatabase', () => {
  beforeEach(() => {
    (sql as any).mockReset();
    logger.info.mockReset();
    logger.error.mockReset();
  });

  it('logs success when connection works', async () => {
    (sql as any).mockResolvedValueOnce([{ now: new Date().toISOString() }]);
    await connectDatabase();
    expect(logger.info).toHaveBeenCalledWith('Database connected');
  });

  it('logs error and throws when connection fails', async () => {
    (sql as any).mockRejectedValueOnce(new Error('failed'));
    await expect(connectDatabase()).rejects.toBeTruthy();
    expect(logger.error).toHaveBeenCalled();
  });
});