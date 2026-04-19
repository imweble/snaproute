import { IncomingMessage, ServerResponse } from 'http';

export function get(req: IncomingMessage & { params?: Record<string, string> }, res: ServerResponse): void {
  const id = req.params?.id ?? 'unknown';
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id, name: `User ${id}` }));
}

export function put(req: IncomingMessage & { params?: Record<string, string>; body?: unknown }, res: ServerResponse): void {
  const id = req.params?.id ?? 'unknown';
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id, updated: true, body: (req as any).body }));
}

export function del(req: IncomingMessage & { params?: Record<string, string> }, res: ServerResponse): void {
  const id = req.params?.id ?? 'unknown';
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id, deleted: true }));
}
