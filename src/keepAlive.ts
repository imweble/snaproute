import { IncomingMessage, ServerResponse } from 'http';
import { getKeepAliveConfig, isKeepAliveEnabled } from './keepAlive.config';

export type KeepAliveMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

export function keepAlive(): KeepAliveMiddleware {
  return function keepAliveMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    if (!isKeepAliveEnabled()) {
      next();
      return;
    }

    const config = getKeepAliveConfig();

    const connection = req.headers['connection']?.toLowerCase();
    const isHttp10 = req.httpVersion === '1.0';

    if (connection === 'close' || isHttp10) {
      res.setHeader('Connection', 'close');
    } else {
      res.setHeader('Connection', 'keep-alive');
      res.setHeader(
        'Keep-Alive',
        `timeout=${config.timeout}, max=${config.maxRequests}`
      );
    }

    next();
  };
}
