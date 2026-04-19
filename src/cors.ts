import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './middleware';

export interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function cors(options: CorsOptions = {}): Middleware {
  const methods = options.methods ?? ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];
  const allowedHeaders = options.allowedHeaders ?? ['Content-Type', 'Authorization'];

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const requestOrigin = req.headers['origin'] ?? '';
    let allowOrigin = '*';

    if (options.origin) {
      if (typeof options.origin === 'string') {
        allowOrigin = options.origin;
      } else if (Array.isArray(options.origin)) {
        allowOrigin = options.origin.includes(requestOrigin) ? requestOrigin : '';
      } else if (typeof options.origin === 'function') {
        allowOrigin = options.origin(requestOrigin) ? requestOrigin : '';
      }
    }

    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }

    if (options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      if (options.maxAge !== undefined) {
        res.setHeader('Access-Control-Max-Age', String(options.maxAge));
      }
      res.writeHead(204);
      res.end();
      return;
    }

    next();
  };
}
