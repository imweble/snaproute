import { IncomingMessage, ServerResponse } from 'http';

export type AuthOptions = {
  secret: string;
  header?: string;
  onUnauthorized?: (res: ServerResponse) => void;
};

const defaultUnauthorized = (res: ServerResponse) => {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
};

export function bearerAuth(options: AuthOptions) {
  const { secret, header = 'authorization', onUnauthorized = defaultUnauthorized } = options;

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const authHeader = (req.headers[header] as string) || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return onUnauthorized(res);
    }

    if (token !== secret) {
      return onUnauthorized(res);
    }

    next();
  };
}

export function apiKeyAuth(options: { apiKey: string; header?: string }) {
  const { apiKey, header = 'x-api-key' } = options;

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const key = req.headers[header] as string;

    if (!key || key !== apiKey) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid API key' }));
      return;
    }

    next();
  };
}
