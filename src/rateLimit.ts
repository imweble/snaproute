import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './middleware';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

interface HitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, HitRecord>();

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

export function rateLimit(options: RateLimitOptions = {}): Middleware {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 100;
  const message = options.message ?? 'Too many requests, please try again later.';

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const ip = getClientIp(req);
    const now = Date.now();

    let record = store.get(ip);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }

    record.count += 1;
    store.set(ip, record);

    const remaining = Math.max(0, max - record.count);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)));

    if (record.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)));
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: message }));
      return;
    }

    next();
  };
}

export function clearStore(): void {
  store.clear();
}
