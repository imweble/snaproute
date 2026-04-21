import { IncomingMessage, ServerResponse } from 'http';
import { createHash } from 'crypto';
import { getRequestFingerprintConfig, isRequestFingerprintEnabled } from './requestFingerprint.config';

export type Middleware = (
  req: IncomingMessage & Record<string, any>,
  res: ServerResponse,
  next: (err?: any) => void
) => void;

export function generateFingerprint(req: IncomingMessage & Record<string, any>): string {
  const config = getRequestFingerprintConfig();
  const parts: string[] = [];

  if (config.useIp) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';
    parts.push(ip);
  }

  if (config.useUserAgent) {
    parts.push(req.headers['user-agent'] || '');
  }

  if (config.useAcceptLanguage) {
    parts.push(req.headers['accept-language'] || '');
  }

  if (config.useAccept) {
    parts.push(req.headers['accept'] || '');
  }

  const raw = parts.join('|');
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

export const requestFingerprint: Middleware = (req, res, next) => {
  if (!isRequestFingerprintEnabled()) {
    return next();
  }

  const config = getRequestFingerprintConfig();
  const fingerprint = generateFingerprint(req);

  req[config.attachAs] = fingerprint;
  res.setHeader(config.headerName, fingerprint);

  next();
};
