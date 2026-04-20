import { IncomingMessage, ServerResponse } from 'http';
import { getBodyLimitConfig, isBodyLimitEnabled } from './bodyLimit.config';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: Error) => void
) => void;

function parseSize(size: string | number): number {
  if (typeof size === 'number') return size;
  const units: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  const match = size.toLowerCase().match(/^([\d.]+)\s*(b|kb|mb|gb)?$/);
  if (!match) throw new Error(`Invalid size format: ${size}`);
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  return Math.floor(value * (units[unit] ?? 1));
}

export function bodyLimit(limitOverride?: string | number): Middleware {
  return (req, res, next) => {
    if (!isBodyLimitEnabled()) return next();

    const config = getBodyLimitConfig();
    const maxBytes = parseSize(limitOverride ?? config.limit);
    let received = 0;

    const onData = (chunk: Buffer) => {
      received += chunk.length;
      if (received > maxBytes) {
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large' }));
      }
    };

    const onEnd = () => {
      req.removeListener('data', onData);
      next();
    };

    req.on('data', onData);
    req.once('end', onEnd);
  };
}
