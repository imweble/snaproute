import { IncomingMessage, ServerResponse } from 'http';

export function get(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id: (req as any).params?.id }));
}

export function put(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ updated: true, id: (req as any).params?.id }));
}

export function del(req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}
