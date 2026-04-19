import { IncomingMessage, ServerResponse } from 'http';
import { getThrottleConfig, isThrottlingEnabled } from './throttle.config';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

interface ThrottleEntry {
  queue: number;
  lastProcessed: number;
}

const store = new Map<string, ThrottleEntry>();

export function clearThrottleStore(): void {
  store.clear();
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

export function throttle(rps?: number): Middleware {
  return (req, res, next) => {
    if (!isThrottlingEnabled()) return next();

    const config = getThrottleConfig();
    const maxRps = rps ?? config.requestsPerSecond;
    const ip = getClientIp(req);
    const now = Date.now();
    const minInterval = 1000 / maxRps;

    const entry = store.get(ip) ?? { queue: 0, lastProcessed: 0 };
    const elapsed = now - entry.lastProcessed;

    if (elapsed < minInterval && entry.queue >= config.maxQueue) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too Many Requests' }));
      return;
    }

    const delay = Math.max(0, minInterval - elapsed);
    entry.queue++;
    store.set(ip, entry);

    setTimeout(() => {
      entry.queue--;
      entry.lastProcessed = Date.now();
      store.set(ip, entry);
      next();
    }, delay);
  };
}
