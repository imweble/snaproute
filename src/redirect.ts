import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './middleware';

/**
 * Redirect status codes
 */
export type RedirectStatus = 301 | 302 | 303 | 307 | 308;

/**
 * Redirect rule definition
 */
export interface RedirectRule {
  from: string | RegExp;
  to: string;
  status?: RedirectStatus;
}

/**
 * Sends a redirect response
 */
export function sendRedirect(
  res: ServerResponse,
  location: string,
  status: RedirectStatus = 302
): void {
  res.writeHead(status, { Location: location });
  res.end();
}

/**
 * Middleware that redirects a single path to a new location
 *
 * @example
 * router.use(redirect('/old-path', '/new-path', 301));
 */
export function redirect(
  from: string | RegExp,
  to: string,
  status: RedirectStatus = 302
): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? '/';
    const matched =
      typeof from === 'string' ? url === from : from.test(url);

    if (matched) {
      const location =
        typeof from === 'string'
          ? to
          : url.replace(from, to);
      sendRedirect(res, location, status);
      return;
    }

    next();
  };
}

/**
 * Middleware that applies a list of redirect rules in order.
 * First matching rule wins.
 *
 * @example
 * router.use(redirectMap([
 *   { from: '/old', to: '/new', status: 301 },
 *   { from: /^\/legacy\/(.+)/, to: '/modern/$1', status: 308 },
 * ]));
 */
export function redirectMap(rules: RedirectRule[]): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? '/';

    for (const rule of rules) {
      const { from, to, status = 302 } = rule;
      const matched =
        typeof from === 'string' ? url === from : from.test(url);

      if (matched) {
        const location =
          typeof from === 'string' ? to : url.replace(from, to);
        sendRedirect(res, location, status);
        return;
      }
    }

    next();
  };
}
