import { IncomingMessage, ServerResponse } from 'http';
import { throttle, clearThrottleStore } from './throttle';
import { configureThrottle, resetThrottleConfig } from './throttle.config';

function mockReqRes(ip = '127.0.0.1'): [IncomingMessage, ServerResponse, jest.Mock] {
  const req = { headers: {}, socket: { remoteAddress: ip } } as unknown as IncomingMessage;
  const res = {
    writeHead: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;
  const next = jest.fn();
  return [req, res, next];
}

beforeEach(() => {
  clearThrottleStore();
  resetThrottleConfig();
});

describe('throttle', () => {
  it('calls next when throttling is disabled', () => {
    configureThrottle({ enabled: false });
    const [req, res, next] = mockReqRes();
    throttle()(req, res, next as any);
    expect(next).toHaveBeenCalled();
  });

  it('calls next on first request', (done) => {
    const [req, res, next] = mockReqRes();
    (next as jest.Mock).mockImplementation(() => done());
    throttle(10)(req, res, next as any);
  });

  it('returns 429 when queue is full', () => {
    configureThrottle({ requestsPerSecond: 1, maxQueue: 0 });
    const ip = '10.0.0.1';
    const [req1, res1, next1] = mockReqRes(ip);
    const [req2, res2, next2] = mockReqRes(ip);

    throttle()(req1, res1, next1 as any);
    throttle()(req2, res2, next2 as any);

    expect(res2.writeHead).toHaveBeenCalledWith(429, expect.any(Object));
    expect(res2.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Too Many Requests' }));
  });

  it('uses x-forwarded-for header for IP', (done) => {
    const req = { headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }, socket: {} } as unknown as IncomingMessage;
    const res = { writeHead: jest.fn(), end: jest.fn() } as unknown as ServerResponse;
    const next = jest.fn().mockImplementation(() => done());
    throttle(100)(req, res, next as any);
  });
});
