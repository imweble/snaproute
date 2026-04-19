import { IncomingMessage, ServerResponse } from 'http';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type Handler = (
  req: IncomingMessage & { params: Record<string, string>; query: Record<string, string> },
  res: ServerResponse
) => void | Promise<void>;

export interface Route {
  method: HttpMethod;
  path: string;
  handler: Handler;
  regex: RegExp;
  paramKeys: string[];
}

export class Router {
  private routes: Route[] = [];

  register(method: HttpMethod, path: string, handler: Handler): void {
    const paramKeys: string[] = [];
    const regexStr = path
      .replace(/\/:[^\/]+/g, (match) => {
        paramKeys.push(match.slice(2));
        return '/([^\/]+)';
      })
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexStr}$`);
    this.routes.push({ method, path, handler, regex, paramKeys });
  }

  match(method: string, pathname: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      const match = pathname.match(route.regex);
      if (match) {
        const params: Record<string, string> = {};
        route.paramKeys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  get routes_() { return this.routes; }
}
