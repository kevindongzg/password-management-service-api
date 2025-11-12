import Koa from 'koa';
import request from 'supertest';
import { correlationId } from '../../../middleware/correlationId';

describe('correlationId middleware', () => {
  it('uses incoming id', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(async (ctx) => {
      ctx.body = { id: ctx.state.correlationId };
    });
    const server = app.callback();
    const res = await request(server).get('/').set('x-correlation-id', 'abc');
    expect(res.headers['x-correlation-id']).toBe('abc');
    expect(res.body.id).toBe('abc');
  });

  it('generates when missing', async () => {
    const app = new Koa();
    app.use(correlationId);
    app.use(async (ctx) => {
      ctx.body = { id: ctx.state.correlationId };
    });
    const server = app.callback();
    const res = await request(server).get('/');
    expect(res.headers['x-correlation-id']).toBeTruthy();
    expect(typeof res.body.id).toBe('string');
  });
});