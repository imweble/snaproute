import { IncomingMessage, ServerResponse } from 'http';
import { getBasicAuthConfig, isBasicAuthEnabled } from './basicAuth.config';

export type BasicAuthVerifier = (
  username: string,
  password: string
) => boolean | Promise<boolean>;

function parseBasicAuthHeader(header: string): { username: string; password: string } | null {
  const match = header.match(/^Basic\s+(.+)$/);
  if (!match) return null;

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) return null;
    return {
      username: decoded.slice(0, colonIndex),
      password: decoded.slice(colonIndex + 1),
    };
  } catch {
    return null;
  }
}

function sendUnauthorized(res: ServerResponse, realm: string): void {
  res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
}

export function basicAuth(verifier?: BasicAuthVerifier) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): Promise<void> => {
    if (!isBasicAuthEnabled()) return next();

    const config = getBasicAuthConfig();
    const authHeader = req.headers['authorization'] ?? '';

    if (!authHeader) {
      sendUnauthorized(res, config.realm);
      return;
    }

    const credentials = parseBasicAuthHeader(authHeader);
    if (!credentials) {
      sendUnauthorized(res, config.realm);
      return;
    }

    const { username, password } = credentials;
    const fn = verifier ?? config.verifier;

    if (!fn) {
      sendUnauthorized(res, config.realm);
      return;
    }

    const valid = await fn(username, password);
    if (!valid) {
      sendUnauthorized(res, config.realm);
      return;
    }

    (req as any).user = { username };
    next();
  };
}
