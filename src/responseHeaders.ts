import { IncomingMessage, ServerResponse } from 'http';
import { getResponseHeadersConfig, isResponseHeadersEnabled } from './responseHeaders.config';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

export type HeadersMap = Record<string, string>;

export function applyHeaders(res: ServerResponse, headers: HeadersMap): void {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

export function responseHeaders(customHeaders?: HeadersMap): Middleware {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (!isResponseHeadersEnabled()) {
      return next();
    }

    const config = getResponseHeadersConfig();
    const headers: HeadersMap = { ...config.headers, ...(customHeaders ?? {}) };

    applyHeaders(res, headers);
    next();
  };
}
