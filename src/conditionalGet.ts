import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './index';

/**
 * Parse a date string from a header value safely.
 */
function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Normalize an ETag value by removing weak prefix and quotes.
 */
function normalizeETag(etag: string): string {
  return etag.replace(/^W\//, '').replace(/"/g, '');
}

/**
 * Check if any of the client ETags match the response ETag.
 */
function etagMatches(clientETags: string, responseETag: string): boolean {
  const normalized = normalizeETag(responseETag);
  return clientETags
    .split(',')
    .map(t => normalizeETag(t.trim()))
    .some(t => t === '*' || t === normalized);
}

/**
 * Middleware that handles conditional GET requests using
 * If-None-Match and If-Modified-Since headers.
 * Sends 304 Not Modified when the resource has not changed.
 */
export function conditionalGet(): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const method = req.method?.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      return next();
    }

    const originalEnd = res.end.bind(res);

    (res as any).end = function (chunk?: any, encoding?: any, callback?: any) {
      const etag = res.getHeader('ETag') as string | undefined;
      const lastModified = res.getHeader('Last-Modified') as string | undefined;
      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];

      let notModified = false;

      if (etag && ifNoneMatch) {
        notModified = etagMatches(ifNoneMatch, etag);
      } else if (lastModified && ifModifiedSince) {
        const lastMod = parseDate(lastModified);
        const clientMod = parseDate(ifModifiedSince);
        if (lastMod && clientMod) {
          notModified = lastMod.getTime() <= clientMod.getTime();
        }
      }

      if (notModified) {
        res.statusCode = 304;
        res.removeHeader('Content-Type');
        res.removeHeader('Content-Length');
        res.removeHeader('Transfer-Encoding');
        return originalEnd(null, encoding, callback);
      }

      return originalEnd(chunk, encoding, callback);
    };

    next();
  };
}
