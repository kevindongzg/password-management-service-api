import Router from '@koa/router';
import type Koa from 'koa';
import type { Middleware, Context, Next } from 'koa';
import { globSync } from 'glob';
import { resolve } from 'path';

const prefixRegistry = new WeakMap<object, string>();

type HttpMethod = 'get' | 'post' | 'put' | 'del' | 'use' | 'all';

interface RouteConf {
  method: HttpMethod;
  path: string;
}

type ControllerCtor = Function; // class constructor
type Prototype = object;
type ControllerMethod = (ctx: Context, next?: Next) => unknown;

type RouterKey = RouteConf & { target: Prototype };

const routerMap = new Map<RouterKey, ControllerMethod>();

const normalizePath = (path: string): string => {
  if (path === '/' || path === '') return '';
  return path.startsWith('/') ? path : `/${path}`;
};

const toArray = <T>(c: T | T[]): T[] => (Array.isArray(c) ? c : [c]);

export const controller = (path: string) => (target: ControllerCtor) => {
  prefixRegistry.set(target.prototype as Prototype, path);
};

const router = (conf: RouteConf) =>
  (target: Prototype, key: string, descriptor: PropertyDescriptor) => {
    conf.path = normalizePath(conf.path);
    const method = (target as any)[key] as ControllerMethod;
    routerMap.set({ target, ...conf }, method);
  };

export const get = (path: string) => router({ method: 'get', path });
export const post = (path: string) => router({ method: 'post', path });
export const put = (path: string) => router({ method: 'put', path });
export const del = (path: string) => router({ method: 'del', path });
export const use = (path: string) => router({ method: 'use', path });
export const all = (path: string) => router({ method: 'all', path });

export class Route {
  app: Koa;
  apiPath: string;
  router: Router;

  constructor(app: Koa, apiPath: string, prefix = '/') {
    this.app = app;
    this.apiPath = apiPath;
    this.router = new Router({ prefix });
  }

  init(): void {
    routerMap.clear();

    globSync(resolve(this.apiPath, `./**/*.{ts,js}`)).forEach((f: string) => {
      try {
        require(f);
      } catch (e) {
        // Swallow individual controller load errors to avoid blocking init; rely on app-level error handling
      }
    });

    for (const [conf, controller] of routerMap) {
      const controllers = toArray<Middleware>(controller as unknown as Middleware);
      const rawPrefix = prefixRegistry.get(conf.target);
      const prefixPath = rawPrefix ? normalizePath(rawPrefix) : '';
      const routerPath = `${prefixPath}${conf.path}`;
      (this.router as any)[conf.method](routerPath, ...controllers);
    }

    // Cast to satisfy Koa middleware typing differences between Router and Koa
    this.app.use(this.router.routes() as unknown as Middleware);
    this.app.use(this.router.allowedMethods() as unknown as Middleware);
  }
}