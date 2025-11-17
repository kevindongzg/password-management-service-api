import Koa from 'koa';
import request from 'supertest';
import { errorHandler } from '../../../middleware/errorHandler';
import { correlationId } from '../../../middleware/correlationId';
import { BadRequestError, ValidationError, NotFoundError, TooManyRequestsError } from '../../../utils/errors';

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
      throw new BadRequestError('Bad', 'BAD');
    });
    const server = app.callback();
    const res = await request(server).get('/x').set('x-correlation-id', 'c-1');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: 'Bad', status: 400, path: '/x', correlationId: 'c-1' });
  });

  it('handles ValidationError with details', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(errorHandler);
    app.use(async () => {
      throw new ValidationError([{ path: 'email', message: 'Invalid email' }]);
    });
    const server = app.callback();
    const res = await request(server).get('/v').set('x-correlation-id', 'c-v');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('handles NotFoundError', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(errorHandler);
    app.use(async () => {
      throw new NotFoundError('Missing', 'NOT_FOUND');
    });
    const server = app.callback();
    const res = await request(server).get('/n').set('x-correlation-id', 'c-n');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Missing');
  });

  it('handles TooManyRequestsError', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(errorHandler);
    app.use(async () => {
      throw new TooManyRequestsError('Rate limited', 'RATE_LIMIT');
    });
    const server = app.callback();
    const res = await request(server).get('/t').set('x-correlation-id', 'c-t');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Rate limited');
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