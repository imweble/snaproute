import { IncomingMessage, ServerResponse } from 'http';
import { conditionalGet } from './conditionalGet';
import {
  configureConditionalGet,
  isConditionalGetEnabled,
  resetConditionalGetConfig,
} from './conditionalGet.config';

function mockReqRes(method = 'GET', headers: Record<string, string> = {}) {
  const req = Object.assign(Object.create(IncomingMessage.prototype), {
    method,
    headers,
  }) as IncomingMessage;

  const resHeaders: Record<string, any> = {};
  let statusCode = 200;
  let endCalled = false;
  let endChunk: any = null;

  const res = {
    statusCode,
    getHeader: (name: string) => resHeaders[name.toLowerCase()],
    setHeader: (name: string, value: any) => { resHeaders[name.toLowerCase()] = value; },
    removeHeader: (name: string) => { delete resHeaders[name.toLowerCase()]; },
    end: (chunk?: any) => { endCalled = true; endChunk = chunk; },
    _endCalled: () => endCalled,
    _endChunk: () => endChunk,
    _statusCode: () => (res as any).statusCode,
  } as unknown as ServerResponse;

  return { req, res };
}

beforeEach(() => resetConditionalGetConfig());

describe('conditionalGet', () => {
  it('calls next for non-GET methods', () => {
    const { req, res } = mockReqRes('POST');
    const next = jest.fn();
    conditionalGet()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 304 when ETag matches If-None-Match', () => {
    const { req, res } = mockReqRes('GET', { 'if-none-match': '"abc123"' });
    const next = jest.fn();
    const mw = conditionalGet();
    mw(req, res, next);
    res.setHeader('ETag', '"abc123"');
    (res as any).end('body');
    expect((res as any).statusCode).toBe(304);
  });

  it('does not return 304 when ETag does not match', () => {
    const { req, res } = mockReqRes('GET', { 'if-none-match': '"xyz"' });
    const next = jest.fn();
    const mw = conditionalGet();
    mw(req, res, next);
    res.setHeader('ETag', '"abc123"');
    (res as any).end('body');
    expect((res as any).statusCode).toBe(200);
  });

  it('returns 304 when Last-Modified not newer than If-Modified-Since', () => {
    const date = 'Wed, 01 Jan 2020 00:00:00 GMT';
    const { req, res } = mockReqRes('GET', { 'if-modified-since': date });
    const next = jest.fn();
    const mw = conditionalGet();
    mw(req, res, next);
    res.setHeader('Last-Modified', date);
    (res as any).end('body');
    expect((res as any).statusCode).toBe(304);
  });

  it('passes through when resource is newer than If-Modified-Since', () => {
    const { req, res } = mockReqRes('GET', { 'if-modified-since': 'Wed, 01 Jan 2020 00:00:00 GMT' });
    const next = jest.fn();
    const mw = conditionalGet();
    mw(req, res, next);
    res.setHeader('Last-Modified', 'Thu, 01 Jan 2021 00:00:00 GMT');
    (res as any).end('body');
    expect((res as any).statusCode).toBe(200);
  });

  it('wildcard If-None-Match matches any ETag', () => {
    const { req, res } = mockReqRes('GET', { 'if-none-match': '*' });
    const next = jest.fn();
    const mw = conditionalGet();
    mw(req, res, next);
    res.setHeader('ETag', '"anything"');
    (res as any).end('body');
    expect((res as any).statusCode).toBe(304);
  });
});

describe('conditionalGet config', () => {
  it('is enabled by default', () => {
    expect(isConditionalGetEnabled()).toBe(true);
  });

  it('can be disabled', () => {
    configureConditionalGet({ enabled: false });
    expect(isConditionalGetEnabled()).toBe(false);
  });

  it('resets to default', () => {
    configureConditionalGet({ enabled: false });
    resetConditionalGetConfig();
    expect(isConditionalGetEnabled()).toBe(true);
  });
});
