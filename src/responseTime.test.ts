import { IncomingMessage, ServerResponse } from 'http';
import { responseTime, setResponseTimeHandler, resetResponseTimeHandler } from './responseTime';
import { configureResponseTime, resetResponseTimeConfig } from './responseTime.config';

function mockReqRes() {
  const req = Object.assign(Object.create(IncomingMessage.prototype), {
    headers: {},
    method: 'GET',
    url: '/test',
  }) as IncomingMessage;

  const headers: Record<string, string> = {};
  const res = Object.assign(Object.create(ServerResponse.prototype), {
    statusCode: 200,
    setHeader: (key: string, value: string) => { headers[key] = value; },
    getHeader: (key: string) => headers[key],
    _headers: headers,
  }) as ServerResponse;

  return { req, res, headers };
}

beforeEach(() => {
  resetResponseTimeConfig();
  resetResponseTimeHandler();
});

describe('responseTime middleware', () => {
  it('sets X-Response-Time header on response end', (done) => {
    const { req, res, headers } = mockReqRes();
    const middleware = responseTime();

    let endCalled = false;
    (res as any).end = function () {
      endCalled = true;
      expect(headers['X-Response-Time']).toMatch(/^\d+(\.\d+)?ms$/);
      done();
    };

    middleware(req, res, () => {
      (res as any).end();
    });
  });

  it('calls next middleware', (done) => {
    const { req, res } = mockReqRes();
    const middleware = responseTime();
    (res as any).end = () => {};

    middleware(req, res, () => {
      done();
    });
  });

  it('uses custom header name when configured', (done) => {
    configureResponseTime({ header: 'X-Time' });
    const { req, res, headers } = mockReqRes();
    const middleware = responseTime();

    (res as any).end = function () {
      expect(headers['X-Time']).toMatch(/^\d+(\.\d+)?ms$/);
      expect(headers['X-Response-Time']).toBeUndefined();
      done();
    };

    middleware(req, res, () => {
      (res as any).end();
    });
  });

  it('calls custom handler with duration', (done) => {
    const { req, res } = mockReqRes();
    (res as any).end = () => {};

    setResponseTimeHandler((req, res, duration) => {
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      done();
    });

    const middleware = responseTime();
    middleware(req, res, () => {
      (res as any).end();
    });
  });

  it('does not set header when disabled', (done) => {
    configureResponseTime({ enabled: false });
    const { req, res, headers } = mockReqRes();
    const middleware = responseTime();

    (res as any).end = function () {
      expect(headers['X-Response-Time']).toBeUndefined();
      done();
    };

    middleware(req, res, () => {
      (res as any).end();
    });
  });

  it('measures time with reasonable precision', (done) => {
    const { req, res, headers } = mockReqRes();
    const middleware = responseTime();

    (res as any).end = function () {
      const value = headers['X-Response-Time'];
      const ms = parseFloat(value);
      expect(ms).toBeGreaterThanOrEqual(0);
      expect(ms).toBeLessThan(1000); // Should complete in under 1s
      done();
    };

    middleware(req, res, () => {
      setTimeout(() => (res as any).end(), 5);
    });
  });
});
