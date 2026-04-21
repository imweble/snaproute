import { IncomingMessage, ServerResponse } from 'http';
import { session, generateSessionId, clearSessionStore } from './session';
import { configureSession, resetSessionConfig } from './session.config';

function mockReqRes(cookieHeader = '') {
  const req = {
    headers: { cookie: cookieHeader },
    session: undefined as Record<string, unknown> | undefined,
  } as unknown as IncomingMessage & { session?: Record<string, unknown> };
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (k: string, v: string) => { headers[k] = v; },
    _headers: headers,
  } as unknown as ServerResponse & { _headers: Record<string, string> };
  return { req, res: res as ServerResponse & { _headers: Record<string, string> } };
}

beforeEach(() => {
  clearSessionStore();
  resetSessionConfig();
});

test('generateSessionId returns a non-empty string', () => {
  const id = generateSessionId();
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
});

test('session middleware attaches session to request', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  session()(req, res, next);
  expect(req.session).toBeDefined();
  expect(next).toHaveBeenCalled();
});

test('session middleware sets Set-Cookie header', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  session()(req, res, next);
  expect(res._headers['Set-Cookie']).toContain('snaproute.sid=');
});

test('session middleware restores existing session', () => {
  const { req: req1, res: res1 } = mockReqRes();
  const next = jest.fn();
  session()(req1, res1, next);
  req1.session!['user'] = 'alice';
  const cookieHeader = res1._headers['Set-Cookie'].split(';')[0];
  const { req: req2, res: res2 } = mockReqRes(cookieHeader);
  session()(req2, res2, next);
  expect(req2.session!['user']).toBe('alice');
});

test('session middleware skips when disabled', () => {
  configureSession({ enabled: false });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  session()(req, res, next);
  expect(req.session).toBeUndefined();
  expect(next).toHaveBeenCalled();
});

test('configureSession applies custom cookieName', () => {
  configureSession({ cookieName: 'my.session' });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  session()(req, res, next);
  expect(res._headers['Set-Cookie']).toContain('my.session=');
});
