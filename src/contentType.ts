import { IncomingMessage, ServerResponse } from 'http';
import { getContentTypeConfig, isContentTypeEnabled } from './contentType.config';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

export function matchesType(contentType: string, allowed: string[]): boolean {
  const base = contentType.split(';')[0].trim().toLowerCase();
  return allowed.some((pattern) => {
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return base.startsWith(prefix);
    }
    return base === pattern.toLowerCase();
  });
}

export function contentType(
  allowed?: string[],
  options?: { strict?: boolean }
): Middleware {
  return (req, res, next) => {
    if (!isContentTypeEnabled()) {
      return next();
    }

    const config = getContentTypeConfig();
    const allowedTypes = allowed ?? config.allowed;
    const strict = options?.strict ?? config.strict;

    const methods = ['POST', 'PUT', 'PATCH'];
    if (!methods.includes((req.method ?? '').toUpperCase())) {
      return next();
    }

    const ct = req.headers['content-type'] ?? '';

    if (!ct && strict) {
      res.writeHead(415, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Content-Type header' }));
      return;
    }

    if (ct && allowedTypes.length > 0 && !matchesType(ct, allowedTypes)) {
      res.writeHead(415, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: `Unsupported Media Type: ${ct.split(';')[0].trim()}`,
        })
      );
      return;
    }

    next();
  };
}
