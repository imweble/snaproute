import { IncomingMessage, ServerResponse } from 'http';
import { requestThrottle, clearRequestThrottleStore } from './requestThrottle';
import { configureRequestThrottle, resetRequestThrottleConfig } from './requestThrottle.config';

function mockReqRes(ip = '127.0.0.1'): { req: Partial<IncomingMessage>; res: Partial<ServerResponse> } {
  const req: Partial<IncomingMessage> = {
    headers: {},
    socket: { remoteAddress: ip } as any,
  };
  const res: Partial<ServerResponse> = {
    statusCode: 200,
    setHeader: jest.fn(),
    end: jest.fn(),
  };
  return { req, res };
}

beforeEach(() => {
  clearRequestThrottleStore();
  resetRequestThrottleConfig();
});

test('allows request when tokens are available', () => {
  const middleware = requestThrottle();
  const { req, res } = mockReqRes();
  const next = jest.fn();
  middleware(req as IncomingMessage, res as ServerResponse, next);
  expect(next).toHaveBeenCalled();
  expect(res.statusCode).toBe(200);
});

test('blocks request when burst is exhausted', () => {
  configureRequestThrottle({ rate: 1, burst: 2 });
  const middleware = requestThrottle();
  const { req, res } = mockReqRes('10.0.0.1');
  const next = jest.fn();
  middleware(req as IncomingMessage, res as ServerResponse, next);
  middleware(req as IncomingMessage, res as ServerResponse, next);
  middleware(req as IncomingMessage, res as ServerResponse, next);
  expect(next).toHaveBeenCalledTimes(2);
  expect(res.statusCode).toBe(429);
  expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Too Many Requests' }));
});

test('skips throttling when disabled', () => {
  configureRequestThrottle({ enabled: false, rate: 1, burst: 1 });
  const middleware = requestThrottle();
  const { req, res } = mockReqRes('10.0.0.2');
  const next = jest.fn();
  middleware(req as IncomingMessage, res as ServerResponse, next);
  middleware(req as IncomingMessage, res as ServerResponse, next);
  middleware(req as IncomingMessage, res as ServerResponse, next);
  expect(next).toHaveBeenCalledTimes(3);
});

test('uses x-forwarded-for header for client ip', () => {
  configureRequestThrottle({ rate: 1, burst: 1 });
  const middleware = requestThrottle();
  const { req, res } = mockReqRes();
  (req as any).headers['x-forwarded-for'] = '192.168.1.1, 10.0.0.1';
  const next = jest.fn();
  middleware(req as IncomingMessage, res as ServerResponse, next);
  middleware(req as IncomingMessage, res as ServerResponse, next);
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.statusCode).toBe(429);
});
