import { IncomingMessage, ServerResponse } from 'http';
import { HttpError } from './errorHandler';

export type AsyncRouteHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;

export type ErrorRouteHandler = (
  err: HttpError,
  req: IncomingMessage,
  res: ServerResponse
) => void;

/**
 * Wraps an async route handler and forwards any thrown errors
 * to the provided error handler (or a basic fallback).
 */
export function asyncHandler(
  fn: AsyncRouteHandler,
  onError?: ErrorRouteHandler
): (req: IncomingMessage, res: ServerResponse) => void {
  return (req: IncomingMessage, res: ServerResponse) => {
    fn(req, res).catch((err: HttpError) => {
      if (onError) {
        onError(err, req, res);
      } else {
        const statusCode = err.statusCode ?? 500;
        const body = JSON.stringify({ error: { statusCode, message: err.message } });
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(body);
      }
    });
  };
}
