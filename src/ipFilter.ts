import { IncomingMessage, ServerResponse } from 'http';
import { getIpFilterConfig } from './ipFilter.config';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

function matchesPattern(ip: string, pattern: string): boolean {
  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    return regex.test(ip);
  }
  return ip === pattern;
}

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? '127.0.0.1';
}

export function ipFilter(): Middleware {
  return (req, res, next) => {
    const config = getIpFilterConfig();
    if (!config.enabled) return next();

    const ip = getClientIp(req);
    const { allowList, denyList } = config;

    if (denyList.length > 0 && denyList.some(p => matchesPattern(ip, p))) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }

    if (allowList.length > 0 && !allowList.some(p => matchesPattern(ip, p))) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }

    next();
  };
}
