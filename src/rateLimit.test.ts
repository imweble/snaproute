import { IncomingMessage, ServerResponse } from 'http';
import { rateLimit, clearStore, getClientIp } from './rateLimit';

function mockReqRes(ip = '127.0.0.1'): {
  req: Partial<IncomingMessage>;
  res: Partial<ServerResponse> & { _status?: number; _body?: string; _headers: Record<string, string> };
} {
  const headers: Record<string, string> = {};
  const res = {
    _headers: headers,
    _status: 200,
    _body: '',
    setHeader(k: string, v: string) { headers[k] = v; },
    writeHead(status: number) { this._status = status; },
    end(body: string) { this._body = body; },
  };
  const req = {
    headers: {},
    socket: { remoteAddress: ip },
  };
  return { req: req as any, res: res as any };
}

beforeEach(() => clearStore());

test('allows requests under limit', () => {
  const mw = rateLimit({ max: 3, windowMs: 10_000 });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  mw(req as any, res as any, next);
  expect(next).toHaveBeenCalled();
  expect(res._headers['X-RateLimit-Remaining']).toBe('2');
});

test('blocks requests over limit', () => {
  const mw = rateLimit({ max: 2, windowMs: 10_000 });
  const next = jest.fn();
  for (let i = 0; i < 3; i++) {
    const { req, res } = mockReqRes();
    mw(req as any, res as any, next);
  }
  const { req, res } = mockReqRes();
  mw(req as any, res as any, next);
  expect(res._status).toBe(429);
});

test('getClientIp uses x-forwarded-for header', () => {
  const req = { headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' }, socket: {} } as any;
  expect(getClientIp(req)).toBe('10.0.0.1');
});

test('sets rate limit headers', () => {
  const mw = rateLimit({ max: 10 });
  const { req, res } = mockReqRes();
  mw(req as any, res as any, jest.fn());
  expect(res._headers['X-RateLimit-Limit']).toBe('10');
  expect(res._headers['X-RateLimit-Reset']).toBeDefined();
});
