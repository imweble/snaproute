export interface CacheOptions {
  ttl?: number; // milliseconds
  maxSize?: number;
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function setCache(key: string, value: string, ttl = 5000): void {
  store.set(key, { value, expiresAt: Date.now() + ttl });
}

export function getCache(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function deleteCache(key: string): void {
  store.delete(key);
}

export function clearCache(): void {
  store.clear();
}

export function cacheSize(): number {
  return store.size;
}

import type { Handler } from './router';

export function cacheMiddleware(options: CacheOptions = {}): Handler {
  const { ttl = 5000 } = options;
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.url ?? '/';
    const cached = getCache(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      res.end(cached);
      return;
    }
    const originalEnd = res.end.bind(res);
    (res as any).end = (body: any) => {
      if (res.statusCode === 200 && body) {
        setCache(key, typeof body === 'string' ? body : String(body), ttl);
      }
      res.setHeader('X-Cache', 'MISS');
      originalEnd(body);
    };
    next();
  };
}
