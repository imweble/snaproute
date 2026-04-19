import { IncomingMessage, ServerResponse } from 'http';

export type NextFunction = (err?: Error) => void;

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
) => void | Promise<void>;

export function compose(middlewares: Middleware[]) {
  return async function (req: IncomingMessage, res: ServerResponse): Promise<void> {
    let index = -1;

    async function dispatch(i: number, err?: Error): Promise<void> {
      if (err) throw err;
      if (i <= index) throw new Error('next() called multiple times');
      index = i;

      const fn = middlewares[i];
      if (!fn) return;

      await fn(req, res, (e?: Error) => dispatch(i + 1, e));
    }

    await dispatch(0);
  };
}

export function logger(): Middleware {
  return (req, _res, next) => {
    const start = Date.now();
    console.log(`--> ${req.method} ${req.url}`);
    next();
    const duration = Date.now() - start;
    console.log(`<-- ${req.method} ${req.url} (${duration}ms)`);
  };
}

export function json(): Middleware {
  return (req, res, next) => {
    const originalEnd = res.end.bind(res);
    (res as any).json = (data: unknown) => {
      res.setHeader('Content-Type', 'application/json');
      originalEnd(JSON.stringify(data));
    };
    next();
  };
}
