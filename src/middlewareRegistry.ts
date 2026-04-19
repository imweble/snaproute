import { Middleware } from './middleware';

export class MiddlewareRegistry {
  private global: Middleware[] = [];
  private routeMap: Map<string, Middleware[]> = new Map();

  use(middleware: Middleware): this;
  use(path: string, middleware: Middleware): this;
  use(pathOrMiddleware: string | Middleware, middleware?: Middleware): this {
    if (typeof pathOrMiddleware === 'string' && middleware) {
      const existing = this.routeMap.get(pathOrMiddleware) ?? [];
      this.routeMap.set(pathOrMiddleware, [...existing, middleware]);
    } else if (typeof pathOrMiddleware === 'function') {
      this.global.push(pathOrMiddleware);
    }
    return this;
  }

  resolve(path: string): Middleware[] {
    const routeSpecific: Middleware[] = [];
    for (const [pattern, middlewares] of this.routeMap.entries()) {
      if (path.startsWith(pattern)) {
        routeSpecific.push(...middlewares);
      }
    }
    return [...this.global, ...routeSpecific];
  }

  clearGlobal(): void {
    this.global = [];
  }

  clearRoute(path: string): void {
    this.routeMap.delete(path);
  }

  clearAll(): void {
    this.global = [];
    this.routeMap.clear();
  }
}

export const registry = new MiddlewareRegistry();
