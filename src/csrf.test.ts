import { IncomingMessage, ServerResponse } from 'http';
import { csrf, generateToken, clearTokenStore } from './csrf';
import { configureCsrf, resetCsrfConfig } from './csrf.config';

function mockReqRes(method = 'GET', headers: Record<string, string> = {}) {
  const req = { method, headers } as unknown as IncomingMessage;
  const res = {
    _status: 200,
    _headers: {} as Record<string, string>,
    _body: '',
    writeHead(status: number, hdrs?: Record<string, string>) {
      this._status = status;
      if (hdrs) Object.assign(this._headers, hdrs);
    },
    setHeader(name: string, value: string) { this._headers[name] = value; },
    end(body?: string) { this._body = body || ''; },
  } as unknown as ServerResponse & { _status: number; _headers: Record<string, string>; _body: string };
  return { req, res };
}

beforeEach(() => {
  clearTokenStore();
  resetCsrfConfig();
});

test('sets token header on GET request', () => {
  const { req, res } = mockReqRes('GET');
  let called = false;
  csrf()(req, res, () => { called = true; });
  expect(called).toBe(true);
  expect((res as any)._headers['X-CSRF-Token']).toBeDefined();
});

test('blocks POST without token', () => {
  const { req, res } = mockReqRes('POST');
  let called = false;
  csrf()(req, res, () => { called = true; });
  expect(called).toBe(false);
  expect((res as any)._status).toBe(403);
});

test('allows POST with valid token', () => {
  const token = generateToken();
  const { req, res } = mockReqRes('POST', { 'x-csrf-token': token });
  let called = false;
  csrf()(req, res, () => { called = true; });
  expect(called).toBe(true);
});

test('rejects expired token', () => {
  configureCsrf({ ttl: 0 });
  const token = generateToken();
  const { req, res } = mockReqRes('POST', { 'x-csrf-token': token });
  let called = false;
  csrf()(req, res, () => { called = true; });
  expect(called).toBe(false);
  expect((res as any)._status).toBe(403);
});

test('skips when disabled', () => {
  configureCsrf({ enabled: false });
  const { req, res } = mockReqRes('POST');
  let called = false;
  csrf()(req, res, () => { called = true; });
  expect(called).toBe(true);
});
