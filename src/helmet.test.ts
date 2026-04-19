import { IncomingMessage, ServerResponse } from 'http';
import { helmet } from './helmet';
import { configureHelmet, resetHelmetConfig } from './helmet.config';

function mockReqRes() {
  const req = {} as IncomingMessage;
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (key: string, value: string) => { headers[key] = value; },
    getHeaders: () => headers,
  } as unknown as ServerResponse;
  return { req, res, headers };
}

afterEach(() => resetHelmetConfig());

test('sets security headers by default', () => {
  const { req, res, headers } = mockReqRes();
  const next = jest.fn();
  helmet()(req, res, next);
  expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
  expect(headers['X-Content-Type-Options']).toBe('nosniff');
  expect(headers['Referrer-Policy']).toBe('no-referrer');
  expect(headers['X-XSS-Protection']).toBe('0');
  expect(next).toHaveBeenCalled();
});

test('sets HSTS header when configured', () => {
  const { req, res, headers } = mockReqRes();
  const next = jest.fn();
  helmet()(req, res, next);
  expect(headers['Strict-Transport-Security']).toContain('max-age=15552000');
  expect(headers['Strict-Transport-Security']).toContain('includeSubDomains');
});

test('skips headers when disabled', () => {
  configureHelmet({ enabled: false });
  const { req, res, headers } = mockReqRes();
  const next = jest.fn();
  helmet()(req, res, next);
  expect(Object.keys(headers)).toHaveLength(0);
  expect(next).toHaveBeenCalled();
});

test('sets CSP header when configured', () => {
  configureHelmet({ contentSecurityPolicy: "default-src 'self'" });
  const { req, res, headers } = mockReqRes();
  const next = jest.fn();
  helmet()(req, res, next);
  expect(headers['Content-Security-Policy']).toBe("default-src 'self'");
});

test('frameguard can be set to DENY', () => {
  configureHelmet({ frameguard: 'DENY' });
  const { req, res, headers } = mockReqRes();
  const next = jest.fn();
  helmet()(req, res, next);
  expect(headers['X-Frame-Options']).toBe('DENY');
});
