import { IncomingMessage, ServerResponse } from 'http';
import { etag, generateETag } from './etag';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = {
    headers,
    method: 'GET',
  } as unknown as IncomingMessage;

  const resHeaders: Record<string, string> = {};
  let statusCode = 200;
  const res = {
    get statusCode() { return statusCode; },
    set statusCode(v: number) { statusCode = v; },
    getHeader: (k: string) => resHeaders[k.toLowerCase()],
    setHeader: (k: string, v: string) => { resHeaders[k.toLowerCase()] = v; },
    write: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;

  return { req, res, resHeaders };
}

describe('generateETag', () => {
  it('should generate a strong etag', () => {
    const tag = generateETag('hello world');
    expect(tag).toMatch(/^"[A-Za-z0-9+/=]+"$/);
  });

  it('should generate a weak etag', () => {
    const tag = generateETag('hello world', true);
    expect(tag).toMatch(/^W\/"[A-Za-z0-9+/=]+"$/);
  });

  it('should produce consistent hashes for the same input', () => {
    expect(generateETag('test')).toBe(generateETag('test'));
  });

  it('should produce different hashes for different input', () => {
    expect(generateETag('foo')).not.toBe(generateETag('bar'));
  });
});

describe('etag middleware', () => {
  it('should set ETag header on response', () => {
    const { req, res, resHeaders } = mockReqRes();
    const middleware = etag();
    const next = jest.fn();

    middleware(req, res, next);
    res.end('hello');

    expect(resHeaders['etag']).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('should return 304 when If-None-Match matches ETag', () => {
    const body = 'hello world';
    const tag = generateETag(body);
    const { req, res } = mockReqRes({ 'if-none-match': tag });
    const middleware = etag();

    middleware(req, res, jest.fn());
    res.end(body);

    expect(res.statusCode).toBe(304);
  });

  it('should not set ETag for 204 responses', () => {
    const { req, res, resHeaders } = mockReqRes();
    res.statusCode = 204;
    const middleware = etag();

    middleware(req, res, jest.fn());
    res.end('no content');

    expect(resHeaders['etag']).toBeUndefined();
  });

  it('should support weak etags via options', () => {
    const { req, res, resHeaders } = mockReqRes();
    const middleware = etag({ weak: true });

    middleware(req, res, jest.fn());
    res.end('body');

    expect(resHeaders['etag']).toMatch(/^W\/"/);
  });
});
