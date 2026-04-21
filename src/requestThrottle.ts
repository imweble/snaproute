import { IncomingMessage, ServerResponse } from 'http';
import { getRequestThrottleConfig, isRequestThrottleEnabled } from './requestThrottle.config';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

interface ThrottleEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, ThrottleEntry>();

export function clearRequestThrottleStore(): void {
  store.clear();
}

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? '127.0.0.1';
}

export function requestThrottle(): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (!isRequestThrottleEnabled()) {
      next();
      return;
    }

    const config = getRequestThrottleConfig();
    const ip = getClientIp(req);
    const now = Date.now();

    let entry = store.get(ip);

    if (!entry) {
      entry = { tokens: config.burst, lastRefill: now };
      store.set(ip, entry);
    }

    const elapsed = (now - entry.lastRefill) / 1000;
    const refill = elapsed * config.rate;
    entry.tokens = Math.min(config.burst, entry.tokens + refill);
    entry.lastRefill = now;

    if (entry.tokens < 1) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Retry-After', String(Math.ceil((1 - entry.tokens) / config.rate)));
      res.end(JSON.stringify({ error: 'Too Many Requests' }));
      return;
    }

    entry.tokens -= 1;
    next();
  };
}
