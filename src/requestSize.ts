import { IncomingMessage, ServerResponse } from 'http';
import { getRequestSizeConfig, isRequestSizeEnabled } from './requestSize.config';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
) => void;

export function parseSize(size: string | number): number {
  if (typeof size === 'number') return size;
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) throw new Error(`Invalid size format: ${size}`);
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  return Math.floor(value * (units[unit] ?? 1));
}

export function requestSize(maxSize?: string | number): Middleware {
  return (req, res, next) => {
    if (!isRequestSizeEnabled()) return next();

    const config = getRequestSizeConfig();
    const limit = maxSize !== undefined ? parseSize(maxSize) : parseSize(config.maxSize);

    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (!isNaN(size) && size > limit) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', maxSize: limit }));
        return;
      }
    }

    let received = 0;
    req.on('data', (chunk: Buffer) => {
      received += chunk.length;
      if (received > limit) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', maxSize: limit }));
        req.destroy();
      }
    });

    next();
  };
}
