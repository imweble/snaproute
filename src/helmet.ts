import { IncomingMessage, ServerResponse } from 'http';
import { getHelmetConfig } from './helmet.config';

export type MiddlewareFn = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => void;

export function helmet(): MiddlewareFn {
  return function helmetMiddleware(req, res, next) {
    const config = getHelmetConfig();

    if (!config.enabled) {
      return next();
    }

    res.setHeader('X-DNS-Prefetch-Control', config.dnsPrefetchControl ? 'on' : 'off');
    res.setHeader('X-Frame-Options', config.frameguard);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', config.referrerPolicy);
    res.setHeader('X-XSS-Protection', '0');

    if (config.hsts) {
      res.setHeader(
        'Strict-Transport-Security',
        `max-age=${config.hsts.maxAge}${config.hsts.includeSubDomains ? '; includeSubDomains' : ''}`
      );
    }

    if (config.contentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', config.contentSecurityPolicy);
    }

    next();
  };
}
