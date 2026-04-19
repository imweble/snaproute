import { IncomingMessage, ServerResponse } from 'http';
import { requestLogger, setLogHandler, resetLogHandler, RequestLogEntry } from './requestLogger';
import { configureRequestLogger, isRequestLoggingEnabled, resetRequestLoggerConfig } from './requestLogger.config';

function mockReqRes(method = 'GET', url = '/test') {
  const req = { method, url } as IncomingMessage;
  const res = {
    statusCode: 200,
    end: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res };
}

describe('requestLogger', () => {
  afterEach(() => {
    resetLogHandler();
    resetRequestLoggerConfig();
  });

  it('calls next', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    requestLogger()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('logs entry on res.end', () => {
    const entries: RequestLogEntry[] = [];
    setLogHandler((entry) => entries.push(entry));
    const { req, res } = mockReqRes('POST', '/api/users');
    const next = jest.fn();
    requestLogger()(req, res, next);
    (res as any).end();
    expect(entries).toHaveLength(1);
    expect(entries[0].method).toBe('POST');
    expect(entries[0].url).toBe('/api/users');
    expect(entries[0].status).toBe(200);
    expect(typeof entries[0].duration).toBe('number');
    expect(typeof entries[0].timestamp).toBe('string');
  });

  it('captures correct status code', () => {
    const entries: RequestLogEntry[] = [];
    setLogHandler((entry) => entries.push(entry));
    const { req, res } = mockReqRes();
    (res as any).statusCode = 404;
    const next = jest.fn();
    requestLogger()(req, res, next);
    (res as any).end();
    expect(entries[0].status).toBe(404);
  });
});

describe('requestLogger.config', () => {
  afterEach(() => resetRequestLoggerConfig());

  it('is enabled by default', () => {
    expect(isRequestLoggingEnabled()).toBe(true);
  });

  it('can be disabled', () => {
    configureRequestLogger({ enabled: false });
    expect(isRequestLoggingEnabled()).toBe(false);
  });

  it('accepts custom handler via config', () => {
    const entries: RequestLogEntry[] = [];
    configureRequestLogger({ handler: (e) => entries.push(e) });
    const { req, res } = mockReqRes();
    requestLogger()(req, res, jest.fn());
    (res as any).end();
    expect(entries).toHaveLength(1);
  });
});
