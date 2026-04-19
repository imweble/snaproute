import { IncomingMessage, ServerResponse } from 'http';
import { createError } from '../../../errorHandler';
import { asyncHandler } from '../../../asyncHandler';

const db: Record<string, { id: string; name: string }> = {
  '1': { id: '1', name: 'Alice' },
  '2': { id: '2', name: 'Bob' },
};

export const get = asyncHandler(async (req: IncomingMessage, res: ServerResponse) => {
  const id = (req as any).params?.id;
  const user = db[id];
  if (!user) throw createError(404, `User ${id} not found`);
  const body = JSON.stringify(user);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(body);
});

export const put = asyncHandler(async (req: IncomingMessage, res: ServerResponse) => {
  const id = (req as any).params?.id;
  if (!db[id]) throw createError(404, `User ${id} not found`);
  const data = (req as any).body as { name?: string };
  if (!data?.name) throw createError(400, 'name is required');
  db[id] = { id, name: data.name };
  const body = JSON.stringify(db[id]);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(body);
});

export const del = asyncHandler(async (req: IncomingMessage, res: ServerResponse) => {
  const id = (req as any).params?.id;
  if (!db[id]) throw createError(404, `User ${id} not found`);
  delete db[id];
  res.writeHead(204);
  res.end();
});
