import { IncomingMessage, ServerResponse } from 'http';
import { getRequestDedupConfig, isRequestDedupEnabled } from './requestDedup.config';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

const pendingRequests = new Map<string, Promise<void>>();

export function clearDedupStore(): void {
  pendingRequests.clear();
}

export function getDedupKey(req: IncomingMessage): string {
  const config = getRequestDedupConfig();
  const url = (req as any).url ?? '/';
  const method = (req.method ?? 'GET').toUpperCase();

  if (config.keyFn) {
    return config.keyFn(req);
  }

  return `${method}:${url}`;
}

export function requestDedup(): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (!isRequestDedupEnabled()) {
      return next();
    }

    const config = getRequestDedupConfig();
    const method = (req.method ?? 'GET').toUpperCase();

    if (!config.methods.includes(method)) {
      return next();
    }

    const key = getDedupKey(req);

    if (pendingRequests.has(key)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Duplicate request in flight' }));
      return;
    }

    let resolve: () => void;
    const promise = new Promise<void>((r) => { resolve = r; });
    pendingRequests.set(key, promise);

    const cleanup = () => {
      pendingRequests.delete(key);
      resolve();
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
  };
}
