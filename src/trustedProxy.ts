import { IncomingMessage, ServerResponse } from 'http';
import { getTrustedProxyConfig, isTrustedProxyEnabled } from './trustedProxy.config';

export type Middleware = (
  req: IncomingMessage & { [key: string]: any },
  res: ServerResponse,
  next: (err?: any) => void
) => void;

const FORWARDED_HEADERS = [
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
];

export function parseForwardedFor(header: string): string[] {
  return header.split(',').map((ip) => ip.trim()).filter(Boolean);
}

export function isTrusted(ip: string, trustedList: string[]): boolean {
  return trustedList.some((trusted) => {
    if (trusted === '*') return true;
    if (trusted.endsWith('/')) return ip.startsWith(trusted.slice(0, -1));
    return ip === trusted;
  });
}

export const trustedProxy: Middleware = (req, res, next) => {
  if (!isTrustedProxyEnabled()) {
    return next();
  }

  const config = getTrustedProxyConfig();
  const remoteAddress = req.socket?.remoteAddress ?? '';

  if (!isTrusted(remoteAddress, config.trusted)) {
    FORWARDED_HEADERS.forEach((h) => delete req.headers[h]);
    return next();
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = parseForwardedFor(String(forwardedFor));
    const depth = Math.min(config.depth ?? 1, ips.length);
    req.clientIp = ips[ips.length - depth] ?? remoteAddress;
  } else {
    req.clientIp = remoteAddress;
  }

  const proto = req.headers['x-forwarded-proto'];
  if (proto) req.protocol = String(proto).split(',')[0].trim();

  const host = req.headers['x-forwarded-host'];
  if (host) req.forwardedHost = String(host).split(',')[0].trim();

  next();
};
