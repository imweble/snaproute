import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './router';
import { getCookieParserConfig, isCookieParserEnabled } from './cookieParser.config';

export interface ParsedCookies {
  [key: string]: string;
}

export function parseCookieHeader(cookieHeader: string): ParsedCookies {
  const cookies: ParsedCookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((pair) => {
    const index = pair.indexOf('=');
    if (index < 0) return;
    const key = pair.slice(0, index).trim();
    const val = pair.slice(index + 1).trim();
    if (!key) return;
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  });

  return cookies;
}

export function cookieParser(): Middleware {
  return (req: IncomingMessage & { cookies?: ParsedCookies }, res: ServerResponse, next: () => void) => {
    if (!isCookieParserEnabled()) {
      return next();
    }

    const config = getCookieParserConfig();
    const cookieHeader = req.headers['cookie'] || '';
    const parsed = parseCookieHeader(cookieHeader);

    if (config.decode) {
      req.cookies = parsed;
    } else {
      const raw: ParsedCookies = {};
      (cookieHeader).split(';').forEach((pair) => {
        const index = pair.indexOf('=');
        if (index < 0) return;
        const key = pair.slice(0, index).trim();
        const val = pair.slice(index + 1).trim();
        if (key) raw[key] = val;
      });
      req.cookies = raw;
    }

    next();
  };
}
