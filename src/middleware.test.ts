import { IncomingMessage, ServerResponse } from 'http';
import { compose, Middleware } from './middleware';

function mockReqRes() {
  const req = {} as IncomingMessage;
  const res = {
    end: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res };
}

describe('compose', () => {
  it('runs middlewares in order', async () => {
    const order: number[] = [];
    const m1: Middleware = (_req, _res, next) => { order.push(1); next(); };
    const m2: Middleware = (_req, _res, next) => { order.push(2); next(); };
    const m3: Middleware = (_req, _res, next) => { order.push(3); next(); };

    const { req, res } = mockReqRes();
    await compose([m1, m2, m3])(req, res);
    expect(order).toEqual([1, 2, 3]);
  });

  it('stops pipeline if next is not called', async () => {
    const order: number[] = [];
    const m1: Middleware = (_req, _res, next) => { order.push(1); next(); };
    const m2: Middleware = (_req, _res, _next) => { order.push(2); };
    const m3: Middleware = (_req, _res, next) => { order.push(3); next(); };

    const { req, res } = mockReqRes();
    await compose([m1, m2, m3])(req, res);
    expect(order).toEqual([1, 2]);
  });

  it('propagates errors thrown in middleware', async () => {
    const boom: Middleware = (_req, _res, _next) => { throw new Error('boom'); };
    const { req, res } = mockReqRes();
    await expect(compose([boom])(req, res)).rejects.toThrow('boom');
  });

  it('handles async middlewares', async () => {
    const order: number[] = [];
    const m1: Middleware = async (_req, _res, next) => { order.push(1); await next(); };
    const m2: Middleware = async (_req, _res, next) => { order.push(2); await next(); };

    const { req, res } = mockReqRes();
    await compose([m1, m2])(req, res);
    expect(order).toEqual([1, 2]);
  });
});
