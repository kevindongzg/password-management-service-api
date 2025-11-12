import type { Context, Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';

export async function correlationId(ctx: Context, next: Next) {
  const incoming = ctx.get('x-correlation-id');
  const correlationId = incoming && incoming.trim().length > 0 ? incoming.trim() : uuidv4();
  ctx.state.correlationId = correlationId;
  ctx.set('x-correlation-id', correlationId);
  await next();
}