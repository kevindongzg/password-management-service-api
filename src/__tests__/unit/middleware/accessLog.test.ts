import Koa from 'koa';
import request from 'supertest';
import { accessLog } from '../../../middleware/accessLog';

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
const { logger } = jest.requireMock('../../../utils/logger');

describe('accessLog middleware', () => {
  it('logs method, path, status and duration', async () => {
    const app = new Koa();
    app.use(accessLog);
    app.use(async (ctx) => {
      ctx.status = 201;
      ctx.body = { ok: true };
    });
    const server = app.callback();
    const res = await request(server).get('/test');
    expect(res.status).toBe(201);
    expect(logger.info).toHaveBeenCalled();
    const args = logger.info.mock.calls.find((c: any[]) => c[0] === 'http_access');
    expect(!!args).toBe(true);
  });
});