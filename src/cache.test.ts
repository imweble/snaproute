import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCache,
  getCache,
  deleteCache,
  clearCache,
  cacheSize,
  cacheMiddleware,
} from './cache';
import type { IncomingMessage, ServerResponse } from 'http';

function mockReqRes(method = 'GET', url = '/test') {
  const req = { method, url } as IncomingMessage;
  const headers: Record<string, string> = {};
  let body: any;
  const res = {
    statusCode: 200,
    setHeader: (k: string, v: string) => { headers[k] = v; },
    end: (b: any) => { body = b; },
    getHeader: (k: string) => headers[k],
    _headers: headers,
    _body: () => body,
  } as unknown as ServerResponse;
  return { req, res, headers, getBody: () => body };
}

beforeEach(() => clearCache());

describe('cache store', () => {
  it('sets and gets a value', () => {
    setCache('key1', 'value1');
    expect(getCache('key1')).toBe('value1');
  });

  it('returns null for missing key', () => {
    expect(getCache('missing')).toBeNull();
  });

  it('expires entries after ttl', async () => {
    setCache('key2', 'value2', 10);
    await new Promise(r => setTimeout(r, 20));
    expect(getCache('key2')).toBeNull();
  });

  it('deletes a key', () => {
    setCache('key3', 'value3');
    deleteCache('key3');
    expect(getCache('key3')).toBeNull();
  });

  it('reports correct size', () => {
    setCache('a', '1');
    setCache('b', '2');
    expect(cacheSize()).toBe(2);
  });
});

describe('cacheMiddleware', () => {
  it('calls next for non-GET requests', async () => {
    const { req, res } = mockReqRes('POST', '/test');
    let called = false;
    const mw = cacheMiddleware();
    await mw(req, res, async () => { called = true; });
    expect(called).toBe(true);
  });

  it('sets X-Cache MISS on first GET', async () => {
    const { req, res, headers, getBody } = mockReqRes('GET', '/items');
    const mw = cacheMiddleware({ ttl: 1000 });
    await mw(req, res, async () => {});
    (res as any).end('{"ok":true}');
    expect(headers['X-Cache']).toBe('MISS');
  });

  it('returns cached response on second GET', async () => {
    setCache('/cached', '{"cached":true}', 5000);
    const { req, res, headers } = mockReqRes('GET', '/cached');
    const mw = cacheMiddleware();
    await mw(req, res, async () => {});
    expect(headers['X-Cache']).toBe('HIT');
  });
});
