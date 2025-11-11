import { controller, get } from '../framework/decorator';
import type { Context } from 'koa';

@controller('/health')
export class HealthController {
  @get('/')
  async health(ctx: Context) {
    ctx.status = 200;
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}