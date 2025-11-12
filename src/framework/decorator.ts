import Router from '@koa/router';
import type Koa from 'koa';
import type { Middleware } from 'koa';
import { globSync } from 'glob';
import { resolve } from 'path';

const prefixRegistry = new WeakMap<object, string>();

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'use' | 'all';

interface RouteConf {
  method: HttpMethod;
  path: string;
}

type ControllerCtor = Function;
type Prototype = object;
type ControllerMethod = Middleware<Koa.DefaultState, Koa.DefaultContext>;

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
  (target: Prototype, key: string) => {
    conf.path = normalizePath(conf.path);
    const method = (target as any)[key] as ControllerMethod;
    routerMap.set({ target, ...conf }, method);
  };

export const get = (path: string) => router({ method: 'get', path });
export const post = (path: string) => router({ method: 'post', path });
export const put = (path: string) => router({ method: 'put', path });
export const del = (path: string) => router({ method: 'delete', path });
export const use = (path: string) => router({ method: 'use', path });
export const all = (path: string) => router({ method: 'all', path });

export class Route {
  app: Koa;
  apiPath: string;
  router: Router<Koa.DefaultState, Koa.DefaultContext>;

  constructor(app: Koa, apiPath: string, prefix = '/') {
    this.app = app;
    this.apiPath = apiPath;
    this.router = new Router<Koa.DefaultState, Koa.DefaultContext>({ prefix });
  }

  init(): void {
    routerMap.clear();

    globSync(resolve(this.apiPath, `./**/*.{ts,js}`)).forEach((f: string) => require(f));

    for (const [conf, controller] of routerMap) {
      const controllers = toArray<Middleware<Koa.DefaultState, Koa.DefaultContext>>(controller as Middleware<Koa.DefaultState, Koa.DefaultContext>);
      const rawPrefix = prefixRegistry.get(conf.target);
      const prefixPath = rawPrefix ? normalizePath(rawPrefix) : '';
      const routerPath = `${prefixPath}${conf.path}`;
      (this.router as any)[conf.method](routerPath, ...controllers);
    }

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }
}