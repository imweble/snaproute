import { IncomingMessage, ServerResponse } from 'http';
import { parseAcceptHeader, getBestMatch, negotiate } from './negotiate';

function mockReqRes(acceptHeader?: string): {
  req: Partial<IncomingMessage> & { negotiatedType?: string };
  res: Partial<ServerResponse> & { headers: Record<string, string>; statusCode: number; body: string };
  next: jest.Mock;
} {
  const headers: Record<string, string> = {};
  const req: Partial<IncomingMessage> & { negotiatedType?: string } = {
    headers: { accept: acceptHeader ?? '*/*' },
  };
  const res = {
    headers,
    statusCode: 200,
    body: '',
    setHeader(name: string, value: string) { headers[name] = value; },
    writeHead(code: number, hdrs?: Record<string, string>) {
      this.statusCode = code;
      if (hdrs) Object.assign(this.headers, hdrs);
    },
    end(data?: string) { this.body = data ?? ''; },
  };
  const next = jest.fn();
  return { req, res: res as any, next };
}

describe('parseAcceptHeader', () => {
  it('parses simple types', () => {
    expect(parseAcceptHeader('application/json')).toEqual(['application/json']);
  });

  it('sorts by quality factor', () => {
    const result = parseAcceptHeader('text/html;q=0.5,application/json;q=0.9');
    expect(result[0]).toBe('application/json');
    expect(result[1]).toBe('text/html');
  });

  it('handles wildcard', () => {
    expect(parseAcceptHeader('*/*')).toEqual(['*/*']);
  });
});

describe('getBestMatch', () => {
  it('returns exact match', () => {
    expect(getBestMatch(['application/json'], ['application/json', 'text/html'])).toBe('application/json');
  });

  it('returns first available for wildcard', () => {
    expect(getBestMatch(['*/*'], ['text/plain', 'application/json'])).toBe('text/plain');
  });

  it('returns null when no match', () => {
    expect(getBestMatch(['application/xml'], ['application/json'])).toBeNull();
  });
});

describe('negotiate middleware', () => {
  it('sets negotiated type and calls next', () => {
    const { req, res, next } = mockReqRes('application/json');
    negotiate({ types: ['application/json', 'text/html'] })(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(req.negotiatedType).toBe('application/json');
    expect(res.headers['Content-Type']).toBe('application/json');
  });

  it('responds 406 when no match', () => {
    const { req, res, next } = mockReqRes('application/xml');
    negotiate({ types: ['application/json'] })(req as any, res as any, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(406);
  });

  it('uses default type for wildcard accept', () => {
    const { req, res, next } = mockReqRes('*/*');
    negotiate({ types: ['application/json', 'text/html'] })(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(req.negotiatedType).toBe('application/json');
  });
});
