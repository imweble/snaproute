import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './middleware';

export interface RequestLogEntry {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
}

export type LogHandler = (entry: RequestLogEntry) => void;

let logHandler: LogHandler = (entry) => {
  const { method, url, status, duration, timestamp } = entry;
  console.log(`[${timestamp}] ${method} ${url} ${status} - ${duration}ms`);
};

export function setLogHandler(handler: LogHandler): void {
  logHandler = handler;
}

export function resetLogHandler(): void {
  logHandler = (entry) => {
    const { method, url, status, duration, timestamp } = entry;
    console.log(`[${timestamp}] ${method} ${url} ${status} - ${duration}ms`);
  };
}

export function requestLogger(): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const start = Date.now();
    const method = req.method || 'GET';
    const url = req.url || '/';

    const originalEnd = res.end.bind(res);

    (res as any).end = function (...args: any[]) {
      const duration = Date.now() - start;
      const entry: RequestLogEntry = {
        method,
        url,
        status: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
      };
      logHandler(entry);
      return originalEnd(...args);
    };

    next();
  };
}
