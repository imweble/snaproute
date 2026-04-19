import { IncomingMessage, ServerResponse } from 'http';
import { createError } from './errorHandler';

export type TimeoutOptions = {
  ms?: number;
  message?: string;
};

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => void;

export function timeout(options: TimeoutOptions = {}): Middleware {
  const ms = options.ms ?? 5000;
  const message = options.message ?? 'Request timed out';

  return (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      const err = createError(503, message);
      next(err);
    }, ms);

    const cleanup = () => {
      if (!timedOut) clearTimeout(timer);
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
  };
}
