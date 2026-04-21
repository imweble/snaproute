import { IncomingMessage, ServerResponse } from 'http';
import { basicAuth } from './basicAuth';
import { configureBasicAuth, resetBasicAuthConfig } from './basicAuth.config';

function mockReqRes(authHeader?: string) {
  const req = { headers: authHeader ? { authorization: authHeader } : {} } as IncomingMessage;
  const res = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: '',
    setHeader(k: string, v: string) { this.headers[k] = v; },
    writeHead(code: number) { this.statusCode = code; },
    end(body: string) { this.body = body; },
  } as unknown as ServerResponse & { headers: Record<string, string>; statusCode: number; body: string };
  return { req, res };
}

const verifier = (u: string, p: string) => u === 'admin' && p === 'pass';

describe('basicAuth', () => {
  afterEach(() => resetBasicAuthConfig());

  it('calls next when disabled', async () => {
    configureBasicAuth({ enabled: false });
    const { req, res } = mockReqRes();
    const next = jest.fn();
    await basicAuth(verifier)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no auth header', async () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    await basicAuth(verifier)(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid credentials', async () => {
    const encoded = Buffer.from('admin:wrong').toString('base64');
    const { req, res } = mockReqRes(`Basic ${encoded}`);
    const next = jest.fn();
    await basicAuth(verifier)(req, res, next);
    expect(res.statusCode).toBe(401);
  });

  it('calls next and sets user for valid credentials', async () => {
    const encoded = Buffer.from('admin:pass').toString('base64');
    const { req, res } = mockReqRes(`Basic ${encoded}`);
    const next = jest.fn();
    await basicAuth(verifier)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ username: 'admin' });
  });

  it('sets WWW-Authenticate header with realm', async () => {
    configureBasicAuth({ realm: 'MyApp' });
    const { req, res } = mockReqRes();
    await basicAuth(verifier)(req, res, jest.fn());
    expect(res.headers['WWW-Authenticate']).toBe('Basic realm="MyApp"');
  });

  it('uses config verifier when no verifier passed', async () => {
    configureBasicAuth({ verifier });
    const encoded = Buffer.from('admin:pass').toString('base64');
    const { req, res } = mockReqRes(`Basic ${encoded}`);
    const next = jest.fn();
    await basicAuth()(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
