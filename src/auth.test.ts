import { bearerAuth, apiKeyAuth } from './auth';
import { IncomingMessage, ServerResponse } from 'http';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as IncomingMessage;
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    writeHead(code: number, h?: Record<string, string>) {
      this.statusCode = code;
      if (h) Object.assign(this.headers, h);
    },
    end: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res };
}

describe('bearerAuth', () => {
  const middleware = bearerAuth({ secret: 'mysecret' });

  it('calls next() for valid bearer token', () => {
    const { req, res } = mockReqRes({ authorization: 'Bearer mysecret' });
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 for missing token', () => {
    const { req, res } = mockReqRes({});
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect((res as any).statusCode).toBe(401);
  });

  it('returns 401 for wrong token', () => {
    const { req, res } = mockReqRes({ authorization: 'Bearer wrongtoken' });
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect((res as any).statusCode).toBe(401);
  });
});

describe('apiKeyAuth', () => {
  const middleware = apiKeyAuth({ apiKey: 'key123' });

  it('calls next() for valid api key', () => {
    const { req, res } = mockReqRes({ 'x-api-key': 'key123' });
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 for invalid api key', () => {
    const { req, res } = mockReqRes({ 'x-api-key': 'badkey' });
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect((res as any).statusCode).toBe(401);
  });
});
