import { IncomingMessage, ServerResponse } from 'http';
import { randomBytes } from 'crypto';
import { getCsrfConfig } from './csrf.config';

const tokenStore = new Map<string, number>();

export function generateToken(): string {
  const token = randomBytes(32).toString('hex');
  tokenStore.set(token, Date.now());
  return token;
}

export function clearTokenStore(): void {
  tokenStore.clear();
}

export function csrf() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const config = getCsrfConfig();
    if (!config.enabled) return next();

    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method || '')) {
      const token = generateToken();
      res.setHeader(config.headerName, token);
      return next();
    }

    const token = (req.headers[config.headerName.toLowerCase()] ||
      req.headers['x-csrf-token']) as string | undefined;

    if (!token || !tokenStore.has(token)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or missing CSRF token' }));
      return;
    }

    const ttl = config.ttl;
    const issued = tokenStore.get(token)!;
    if (Date.now() - issued > ttl) {
      tokenStore.delete(token);
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'CSRF token expired' }));
      return;
    }

    tokenStore.delete(token);
    next();
  };
}
