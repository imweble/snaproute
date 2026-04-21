import { IncomingMessage, ServerResponse } from 'http';
import { parseCookieHeader, cookieParser, ParsedCookies } from './cookieParser';
import { configureCookieParser, resetCookieParserConfig } from './cookieParser.config';

function mockReqRes(cookieHeader?: string): {
  req: IncomingMessage & { cookies?: ParsedCookies };
  res: ServerResponse;
} {
  const req = {
    headers: { cookie: cookieHeader || '' },
  } as IncomingMessage & { cookies?: ParsedCookies };
  const res = {} as ServerResponse;
  return { req, res };
}

beforeEach(() => resetCookieParserConfig());

describe('parseCookieHeader', () => {
  it('parses simple cookies', () => {
    const result = parseCookieHeader('name=John; age=30');
    expect(result).toEqual({ name: 'John', age: '30' });
  });

  it('decodes URI-encoded values', () => {
    const result = parseCookieHeader('greeting=hello%20world');
    expect(result.greeting).toBe('hello world');
  });

  it('returns empty object for empty string', () => {
    expect(parseCookieHeader('')).toEqual({});
  });

  it('skips pairs without equals sign', () => {
    const result = parseCookieHeader('invalid; key=value');
    expect(result).toEqual({ key: 'value' });
  });
});

describe('cookieParser middleware', () => {
  it('attaches parsed cookies to req', () => {
    const { req, res } = mockReqRes('token=abc123; user=alice');
    const next = jest.fn();
    cookieParser()(req, res, next);
    expect(req.cookies).toEqual({ token: 'abc123', user: 'alice' });
    expect(next).toHaveBeenCalled();
  });

  it('sets empty cookies when no cookie header', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    cookieParser()(req, res, next);
    expect(req.cookies).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('skips parsing when disabled', () => {
    configureCookieParser({ enabled: false });
    const { req, res } = mockReqRes('token=abc');
    const next = jest.fn();
    cookieParser()(req, res, next);
    expect(req.cookies).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('stores raw values when decode is false', () => {
    configureCookieParser({ decode: false });
    const { req, res } = mockReqRes('greeting=hello%20world');
    const next = jest.fn();
    cookieParser()(req, res, next);
    expect(req.cookies?.greeting).toBe('hello%20world');
  });
});
