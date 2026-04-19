import http, { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Router, Handler, HttpMethod } from './router';

export class Snaproute {
  private router = new Router();

  get(path: string, handler: Handler) { this.router.register('GET', path, handler); }
  post(path: string, handler: Handler) { this.router.register('POST', path, handler); }
  put(path: string, handler: Handler) { this.router.register('PUT', path, handler); }
  patch(path: string, handler: Handler) { this.router.register('PATCH', path, handler); }
  delete(path: string, handler: Handler) { this.router.register('DELETE', path, handler); }

  listen(port: number, callback?: () => void): http.Server {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const parsed = parse(req.url || '/', true);
      const pathname = parsed.pathname || '/';
      const query = parsed.query as Record<string, string>;

      const matched = this.router.match(req.method || 'GET', pathname);

      if (!matched) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
      }

      const enrichedReq = Object.assign(req, { params: matched.params, query });

      try {
        await matched.route.handler(enrichedReq as any, res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });

    server.listen(port, callback);
    return server;
  }
}

export default function snaproute(): Snaproute {
  return new Snaproute();
}
