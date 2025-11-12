import Koa from 'koa';
import request from 'supertest';
import { errorHandler } from '../../../middleware/errorHandler';
import { correlationId } from '../../../middleware/correlationId';
import { makeAppError } from '../../../utils/errors';

jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('errorHandler', () => {
  it('handles AppError with code and correlationId', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(errorHandler);
    app.use(async () => {
      throw makeAppError('Bad', 400, 'BAD');
    });
    const server = app.callback();
    const res = await request(server).get('/x').set('x-correlation-id', 'c-1');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: 'Bad', status: 400, path: '/x', correlationId: 'c-1' });
  });

  it('sanitizes 500 errors', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(errorHandler);
    app.use(async () => {
      throw new Error('boom');
    });
    const server = app.callback();
    const res = await request(server).get('/y');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
    expect(res.body.path).toBe('/y');
  });
});