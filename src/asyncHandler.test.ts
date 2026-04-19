import { IncomingMessage, ServerResponse } from 'http';
import { asyncHandler } from './asyncHandler';
import { createError, errorHandler } from './errorHandler';

function mockReqRes() {
  const req = {} as IncomingMessage;
  let statusCode = 0;
  let body = '';
  const res = {
    writeHead(code: number) { statusCode = code; },
    end(data: string) { body = data; },
  } as unknown as ServerResponse;
  return { req, res, getStatus: () => statusCode, getBody: () => body };
}

describe('asyncHandler', () => {
  it('calls the async handler normally', async () => {
    const { req, res, getStatus } = mockReqRes();
    const handler = asyncHandler(async (_req, r) => {
      r.writeHead(200);
      r.end('');
    });
    handler(req, res);
    await new Promise(r => setTimeout(r, 10));
    expect(getStatus()).toBe(200);
  });

  it('uses built-in fallback on error', async () => {
    const { req, res, getStatus, getBody } = mockReqRes();
    const handler = asyncHandler(async () => {
      throw createError(400, 'Bad input');
    });
    handler(req, res);
    await new Promise(r => setTimeout(r, 10));
    expect(getStatus()).toBe(400);
    expect(JSON.parse(getBody()).error.message).toBe('Bad input');
  });

  it('delegates to custom onError handler', async () => {
    const { req, res, getStatus } = mockReqRes();
    const handler = asyncHandler(
      async () => { throw createError(503, 'Unavailable'); },
      errorHandler
    );
    handler(req, res);
    await new Promise(r => setTimeout(r, 10));
    expect(getStatus()).toBe(503);
  });

  it('defaults to 500 for generic errors', async () => {
    const { req, res, getStatus } = mockReqRes();
    const handler = asyncHandler(async () => { throw new Error('boom'); });
    handler(req, res);
    await new Promise(r => setTimeout(r, 10));
    expect(getStatus()).toBe(500);
  });
});
