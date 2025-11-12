import 'koa';

declare module 'koa' {
  interface DefaultState {
    correlationId?: string;
  }
}