import { IncomingMessage, ServerResponse } from 'http';

export interface HttpError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function createError(statusCode: number, message: string, details?: unknown): HttpError {
  const err: HttpError = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}

export function errorHandler(
  err: HttpError,
  _req: IncomingMessage,
  res: ServerResponse
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  const body = JSON.stringify({
    error: {
      statusCode,
      message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    },
  });

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function notFound(_req: IncomingMessage, res: ServerResponse): void {
  const body = JSON.stringify({ error: { statusCode: 404, message: 'Not Found' } });
  res.writeHead(404, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}
