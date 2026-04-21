import { IncomingMessage, ServerResponse } from 'http';
import { responseCache, clearResponseCacheStore } from './responseCache';
import { configureResponseCache, resetResponseCacheConfig } from './responseCache.config';

function mockReqRes(method = 'GET', url = '/test') {
  const req = { method, url, headers: {} } as IncomingMessage;
  const headers: Record<string, any> = {};
  const res = {
    statusCode: 200,
    setHeader: (k: string, v: any) => { headers[k] = v; },
    getHeader: (k: string) => headers[k],
    getHeaderNames: () => Object.keys(headers),
    write: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res, headers };
}

beforeEach(() => {
  clearResponseCacheStore();
  resetResponseCacheConfig();
});

test('calls next and sets X-Cache MISS on first request', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  responseCache(req, res, next);
  expect(next).toHaveBeenCalled();
});

test('serves cached response with X-Cache HIT on second request', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn(() => {
    (res as any).end('hello');
  });
  responseCache(req, res, next);

  const { req: req2, res: res2, headers: h2 } = mockReqRes();
  const next2 = jest.fn();
  responseCache(req2, res2, next2);

  expect(next2).not.toHaveBeenCalled();
  expect(h2['X-Cache']).toBe('HIT');
});

test('skips caching for POST requests', () => {
  const { req, res } = mockReqRes('POST', '/data');
  const next = jest.fn();
  responseCache(req, res, next);
  expect(next).toHaveBeenCalled();
});

test('does nothing when disabled', () => {
  configureResponseCache({ enabled: false });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  responseCache(req, res, next);
  expect(next).toHaveBeenCalled();
});

test('respects custom methods config', () => {
  configureResponseCache({ methods: ['POST'] });
  const { req, res } = mockReqRes('GET', '/skip');
  const next = jest.fn();
  responseCache(req, res, next);
  expect(next).toHaveBeenCalled();

  const { req: req2, res: res2 } = mockReqRes('GET', '/skip');
  const next2 = jest.fn();
  responseCache(req2, res2, next2);
  expect(next2).toHaveBeenCalled();
});
