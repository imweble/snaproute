import { IncomingMessage, ServerResponse } from 'http';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

/**
 * Append a field to the Vary header, avoiding duplicates.
 */
export function appendVary(res: ServerResponse, field: string): void {
  const current = res.getHeader('Vary');
  const fields = field
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  if (!fields.length) return;

  if (current === '*') return;

  const existing: string[] = current
    ? String(current)
        .split(',')
        .map((f) => f.trim())
    : [];

  if (existing.includes('*')) return;

  for (const f of fields) {
    if (f === '*') {
      res.setHeader('Vary', '*');
      return;
    }
    const lower = f.toLowerCase();
    if (!existing.some((e) => e.toLowerCase() === lower)) {
      existing.push(f);
    }
  }

  res.setHeader('Vary', existing.join(', '));
}

/**
 * Middleware that appends one or more fields to the Vary response header.
 *
 * @example
 *   app.use(vary('Accept-Encoding'))
 *   app.use(vary('Accept, Accept-Language'))
 */
export function vary(...fields: string[]): Middleware {
  if (!fields.length) {
    throw new TypeError('vary: at least one field is required');
  }

  return function varyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    for (const field of fields) {
      appendVary(res, field);
    }
    next();
  };
}
