import { parseQuery, parseValue, queryParser } from './queryParser';
import { IncomingMessage, ServerResponse } from 'http';

function mockReqRes(url = '/') {
  const req = { url } as IncomingMessage & { query?: Record<string, unknown> };
  const res = {} as ServerResponse;
  return { req, res };
}

describe('parseValue', () => {
  it('parses boolean true', () => {
    expect(parseValue('true', { parseBooleans: true })).toBe(true);
  });

  it('parses boolean false', () => {
    expect(parseValue('false', { parseBooleans: true })).toBe(false);
  });

  it('parses numbers', () => {
    expect(parseValue('42', { parseNumbers: true })).toBe(42);
  });

  it('returns string when options disabled', () => {
    expect(parseValue('true', { parseBooleans: false })).toBe('true');
    expect(parseValue('42', { parseNumbers: false })).toBe('42');
  });

  it('returns string for non-numeric non-boolean values', () => {
    expect(parseValue('hello', { parseBooleans: true, parseNumbers: true })).toBe('hello');
  });
});

describe('parseQuery', () => {
  it('parses simple key-value pairs', () => {
    const result = parseQuery('name=alice&age=30');
    expect(result).toEqual({ name: 'alice', age: 30 });
  });

  it('parses array values', () => {
    const result = parseQuery('tag=a&tag=b', { parseArrays: true });
    expect(result.tag).toEqual(['a', 'b']);
  });

  it('returns empty object for empty string', () => {
    expect(parseQuery('')).toEqual({});
  });

  it('parses booleans in query string', () => {
    const result = parseQuery('active=true&deleted=false');
    expect(result).toEqual({ active: true, deleted: false });
  });
});

describe('queryParser middleware', () => {
  it('attaches parsed query to req', () => {
    const { req, res } = mockReqRes('/api?foo=bar&count=5');
    const next = jest.fn();
    queryParser()(req, res, next);
    expect(req.query).toEqual({ foo: 'bar', count: 5 });
    expect(next).toHaveBeenCalled();
  });

  it('handles requests with no query string', () => {
    const { req, res } = mockReqRes('/api');
    const next = jest.fn();
    queryParser()(req, res, next);
    expect(req.query).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('respects custom options', () => {
    const { req, res } = mockReqRes('/api?flag=true&num=7');
    const next = jest.fn();
    queryParser({ parseBooleans: false, parseNumbers: false })(req, res, next);
    expect(req.query).toEqual({ flag: 'true', num: '7' });
  });
});
