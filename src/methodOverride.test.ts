import http from 'http';
import { getOverrideMethod, methodOverride } from './methodOverride';

function mockReqRes(method = 'POST', overrideHeader?: string, overrideBody?: string, overrideQuery?: string) {
  const req = {
    method,
    headers: overrideHeader ? { 'x-http-method-override': overrideHeader } : {},
    url: overrideQuery ? `/?_method=${overrideQuery}` : '/',
    body: overrideBody ? { _method: overrideBody } : {},
  } as unknown as http.IncomingMessage & { body?: Record<string, string> };

  const res = {
    writeHead: jest.fn(),
    end: jest.fn(),
  } as unknown as http.ServerResponse;

  return { req, res };
}

describe('getOverrideMethod', () => {
  it('returns header override when present', () => {
    const { req } = mockReqRes('POST', 'DELETE');
    expect(getOverrideMethod(req as any)).toBe('DELETE');
  });

  it('returns body override when header absent', () => {
    const { req } = mockReqRes('POST', undefined, 'PUT');
    expect(getOverrideMethod(req as any)).toBe('PUT');
  });

  it('returns query override when header and body absent', () => {
    const { req } = mockReqRes('POST', undefined, undefined, 'PATCH');
    expect(getOverrideMethod(req as any)).toBe('PATCH');
  });

  it('returns undefined when no override present', () => {
    const { req } = mockReqRes('POST');
    expect(getOverrideMethod(req as any)).toBeUndefined();
  });

  it('uppercases the override method', () => {
    const { req } = mockReqRes('POST', 'delete');
    expect(getOverrideMethod(req as any)).toBe('DELETE');
  });
});

describe('methodOverride middleware', () => {
  it('overrides method from header on POST request', () => {
    const { req, res } = mockReqRes('POST', 'DELETE');
    const next = jest.fn();
    methodOverride()(req as any, res, next);
    expect((req as any).method).toBe('DELETE');
    expect(next).toHaveBeenCalled();
  });

  it('does not override method on non-POST request', () => {
    const { req, res } = mockReqRes('GET', 'DELETE');
    const next = jest.fn();
    methodOverride()(req as any, res, next);
    expect((req as any).method).toBe('GET');
    expect(next).toHaveBeenCalled();
  });

  it('only allows whitelisted methods', () => {
    const { req, res } = mockReqRes('POST', 'CONNECT');
    const next = jest.fn();
    methodOverride()(req as any, res, next);
    expect((req as any).method).toBe('POST');
    expect(next).toHaveBeenCalled();
  });

  it('calls next when no override present', () => {
    const { req, res } = mockReqRes('POST');
    const next = jest.fn();
    methodOverride()(req as any, res, next);
    expect((req as any).method).toBe('POST');
    expect(next).toHaveBeenCalled();
  });
});
