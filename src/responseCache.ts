import { IncomingMessage, ServerResponse } from 'http';
import { getResponseCacheConfig, isResponseCacheEnabled } from './responseCache.config';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

interface CacheEntry {
  body: string;
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function clearResponseCacheStore(): void {
  store.clear();
}

function getCacheKey(req: IncomingMessage): string {
  return `${req.method}:${req.url}`;
}

export const responseCache: Middleware = (req, res, next) => {
  if (!isResponseCacheEnabled()) return next();

  const config = getResponseCacheConfig();
  const allowedMethods = config.methods ?? ['GET', 'HEAD'];

  if (!allowedMethods.includes(req.method ?? '')) return next();

  const key = getCacheKey(req);
  const cached = store.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    res.statusCode = cached.statusCode;
    for (const [header, value] of Object.entries(cached.headers)) {
      if (value !== undefined) res.setHeader(header, value);
    }
    res.setHeader('X-Cache', 'HIT');
    res.end(cached.body);
    return;
  }

  const originalEnd = res.end.bind(res);
  const chunks: Buffer[] = [];

  const originalWrite = res.write.bind(res);
  res.write = (chunk: any, ...args: any[]) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return (originalWrite as any)(chunk, ...args);
  };

  (res as any).end = (chunk?: any, ...args: any[]) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const body = Buffer.concat(chunks).toString();
    const ttl = config.ttl ?? 60;

    const headersSnapshot: Record<string, string | string[] | undefined> = {};
    for (const key of res.getHeaderNames()) {
      headersSnapshot[key] = res.getHeader(key) as string | string[] | undefined;
    }

    store.set(key, {
      body,
      statusCode: res.statusCode,
      headers: headersSnapshot,
      expiresAt: Date.now() + ttl * 1000,
    });

    res.setHeader('X-Cache', 'MISS');
    return originalEnd(chunk, ...args);
  };

  next();
};
