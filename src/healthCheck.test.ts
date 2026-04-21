import { IncomingMessage, ServerResponse } from 'http';
import { healthCheck, runChecks } from './healthCheck';
import {
  configureHealthCheck,
  resetHealthCheckConfig,
} from './healthCheck.config';

function mockReqRes(url = '/health', method = 'GET') {
  const req = { url, method, headers: {} } as IncomingMessage;
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string | number>,
    body: '',
    writeHead(code: number, headers: Record<string, string | number>) {
      this.statusCode = code;
      this.headers = { ...this.headers, ...headers };
    },
    end(data: string) {
      this.body = data;
    },
  } as unknown as ServerResponse & { body: string; headers: Record<string, string | number> };
  const next = jest.fn();
  return { req, res, next };
}

afterEach(() => resetHealthCheckConfig());

describe('runChecks', () => {
  it('returns ok for passing checks', async () => {
    const result = await runChecks({ db: async () => true });
    expect(result.db.status).toBe('ok');
  });

  it('returns error for failing checks', async () => {
    const result = await runChecks({ db: async () => false });
    expect(result.db.status).toBe('error');
  });

  it('captures thrown errors', async () => {
    const result = await runChecks({
      db: async () => { throw new Error('connection refused'); },
    });
    expect(result.db.status).toBe('error');
    expect(result.db.message).toBe('connection refused');
  });
});

describe('healthCheck middleware', () => {
  it('responds 200 on /health with no checks', async () => {
    const { req, res, next } = mockReqRes();
    await healthCheck()(req, res, next);
    expect((res as any).statusCode).toBe(200);
    expect(next).not.toHaveBeenCalled();
    const body = JSON.parse((res as any).body);
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');
  });

  it('calls next for non-health paths', async () => {
    const { req, res, next } = mockReqRes('/api/users');
    await healthCheck()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('responds 503 when a check fails', async () => {
    const { req, res, next } = mockReqRes();
    await healthCheck({ db: async () => false })(req, res, next);
    expect((res as any).statusCode).toBe(503);
    const body = JSON.parse((res as any).body);
    expect(body.status).toBe('degraded');
  });

  it('respects custom path config', async () => {
    configureHealthCheck({ path: '/status' });
    const { req, res, next } = mockReqRes('/status');
    await healthCheck()(req, res, next);
    expect((res as any).statusCode).toBe(200);
  });

  it('calls next when disabled', async () => {
    configureHealthCheck({ enabled: false });
    const { req, res, next } = mockReqRes();
    await healthCheck()(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
