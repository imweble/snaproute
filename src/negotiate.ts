import { IncomingMessage, ServerResponse } from 'http';

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => void;

export interface NegotiateOptions {
  defaultType?: string;
  types?: string[];
}

const defaultOptions: NegotiateOptions = {
  defaultType: 'application/json',
  types: ['application/json', 'text/html', 'text/plain'],
};

export function parseAcceptHeader(header: string): string[] {
  return header
    .split(',')
    .map((part) => {
      const [type, q] = part.trim().split(';q=');
      return { type: type.trim(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q)
    .map((item) => item.type);
}

export function getBestMatch(
  accepted: string[],
  available: string[]
): string | null {
  for (const type of accepted) {
    if (type === '*/*') return available[0] ?? null;
    const [acceptedMain] = type.split('/');
    for (const avail of available) {
      const [availMain] = avail.split('/');
      if (type === avail) return avail;
      if (acceptedMain === availMain && type.endsWith('/*')) return avail;
    }
  }
  return null;
}

export function negotiate(options: NegotiateOptions = {}): Middleware {
  const config = { ...defaultOptions, ...options };
  const available = config.types ?? [];
  const fallback = config.defaultType ?? 'application/json';

  return (req: IncomingMessage & { negotiatedType?: string }, res: ServerResponse, next) => {
    const acceptHeader = (req.headers['accept'] as string) || '*/*';
    const accepted = parseAcceptHeader(acceptHeader);
    const match = getBestMatch(accepted, available);

    if (!match) {
      res.writeHead(406, { 'Content-Type': 'text/plain' });
      res.end('Not Acceptable');
      return;
    }

    req.negotiatedType = match ?? fallback;
    res.setHeader('Content-Type', req.negotiatedType);
    next();
  };
}
