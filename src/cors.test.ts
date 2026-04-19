import { cors } from './cors';
import { IncomingMessage, ServerResponse } from 'http';

function mockReqRes(method = 'GET', origin = 'http://example.com') {
  const resHeaders: Record<string, string> = {};
  let statusCode = 200;
  const res = {
    _headers: resHeaders,
    _status: statusCode,
    _ended: false,
    setHeader(k: string, v: string) { resHeaders[k] = v; },
    writeHead(s: number) { this._status = s; },
    end() { this._ended = true; },
  };
  const req = { method, headers: { origin } };
  return { req: req as any, res: res as any };
}

test('sets wildcard origin by default', () => {
  const mw = cors();
  const { req, res } = mockReqRes();
  mw(req, res, jest.fn());
  expect(res._headers['Access-Control-Allow-Origin']).toBe('*');
});

test('reflects origin when function returns true', () => {
  const mw = cors({ origin: () => true });
  const { req, res } = mockReqRes('GET', 'http://trusted.com');
  mw(req, res, jest.fn());
  expect(res._headers['Access-Control-Allow-Origin']).toBe('http://trusted.com');
});

test('handles preflight OPTIONS request', () => {
  const mw = cors({ methods: ['GET', 'POST'] });
  const { req, res } = mockReqRes('OPTIONS');
  const next = jest.fn();
  mw(req, res, next);
  expect(res._status).toBe(204);
  expect(res._ended).toBe(true);
  expect(next).not.toHaveBeenCalled();
});

test('sets credentials header when enabled', () => {
  const mw = cors({ credentials: true });
  const { req, res } = mockReqRes();
  mw(req, res, jest.fn());
  expect(res._headers['Access-Control-Allow-Credentials']).toBe('true');
});

test('calls next for non-OPTIONS requests', () => {
  const mw = cors();
  const { req, res } = mockReqRes('GET');
  const next = jest.fn();
  mw(req, res, next);
  expect(next).toHaveBeenCalled();
});
