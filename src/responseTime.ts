import { IncomingMessage, ServerResponse } from 'http';
import { getResponseTimeConfig, isResponseTimeEnabled } from './responseTime.config';

export type ResponseTimeHandler = (req: IncomingMessage, res: ServerResponse, time: number) => void;

let customHandler: ResponseTimeHandler | null = null;

export function setResponseTimeHandler(handler: ResponseTimeHandler): void {
  customHandler = handler;
}

export function resetResponseTimeHandler(): void {
  customHandler = null;
}

export function responseTime(
  handler?: ResponseTimeHandler
) {
  return function (req: IncomingMessage, res: ServerResponse, next: () => void): void {
    if (!isResponseTimeEnabled()) {
      return next();
    }

    const config = getResponseTimeConfig();
    const startAt = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(startAt);
      const timeMs = diff[0] * 1e3 + diff[1] * 1e-6;
      const rounded = parseFloat(timeMs.toFixed(config.digits));

      const cb = handler || customHandler;
      if (cb) {
        cb(req, res, rounded);
      } else {
        res.setHeader(config.header, `${rounded}ms`);
      }
    });

    next();
  };
}
