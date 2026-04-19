import { IncomingMessage, ServerResponse } from 'http';
import { timeout } from './timeout';

function mockReqRes() {
  const req = {} as IncomingMessage;
  const listeners: Record<string, () => void> = {};
  const res = {
    on: (event: string, cb: () => void) => { listeners[event] = cb; },
    emit: (event: string) => listeners[event]?.(),
  } as unknown as ServerResponse & { emit: (e: string) => void };
  return { req, res };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('timeout middleware', () => {
  it('calls next without error within time limit', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    timeout({ ms: 1000 })(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with 503 error after timeout', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    timeout({ ms: 500 })(req, res, next);
    jest.advanceTimersByTime(600);
    expect(next).toHaveBeenCalledTimes(2);
    const err = next.mock.calls[1][0] as any;
    expect(err.status).toBe(503);
    expect(err.message).toBe('Request timed out');
  });

  it('uses custom message', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    timeout({ ms: 100, message: 'Too slow' })(req, res, next);
    jest.advanceTimersByTime(200);
    const err = next.mock.calls[1][0] as any;
    expect(err.message).toBe('Too slow');
  });

  it('does not fire after response finishes', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    timeout({ ms: 500 })(req, res, next);
    res.emit('finish');
    jest.advanceTimersByTime(600);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
