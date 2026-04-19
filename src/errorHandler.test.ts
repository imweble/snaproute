import { IncomingMessage, ServerResponse } from 'http';
import { createError, errorHandler, notFound } from './errorHandler';

function mockReqRes() {
  const req = {} as IncomingMessage;
  const headers: Record<string, string | number> = {};
  let statusCode = 0;
  let body = '';
  const res = {
    writeHead(code: number, hdrs: Record<string, string | number>) {
      statusCode = code;
      Object.assign(headers, hdrs);
    },
    end(data: string) { body = data; },
  } as unknown as ServerResponse;
  return { req, res, getStatus: () => statusCode, getBody: () => body, getHeaders: () => headers };
}

describe('createError', () => {
  it('creates an error with statusCode and details', () => {
    const err = createError(400, 'Bad Request', { field: 'name' });
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad Request');
    expect(err.details).toEqual({ field: 'name' });
  });
});

describe('errorHandler', () => {
  it('responds with error statusCode and JSON body', () => {
    const { req, res, getStatus, getBody } = mockReqRes();
    const err = createError(422, 'Unprocessable Entity', ['invalid']);
    errorHandler(err, req, res);
    expect(getStatus()).toBe(422);
    const parsed = JSON.parse(getBody());
    expect(parsed.error.statusCode).toBe(422);
    expect(parsed.error.message).toBe('Unprocessable Entity');
    expect(parsed.error.details).toEqual(['invalid']);
  });

  it('defaults to 500 when statusCode is missing', () => {
    const { req, res, getStatus } = mockReqRes();
    errorHandler(new Error('oops') as any, req, res);
    expect(getStatus()).toBe(500);
  });

  it('omits details when not provided', () => {
    const { req, res, getBody } = mockReqRes();
    errorHandler(createError(404, 'Not Found'), req, res);
    const parsed = JSON.parse(getBody());
    expect(parsed.error.details).toBeUndefined();
  });
});

describe('notFound', () => {
  it('responds with 404 JSON', () => {
    const { req, res, getStatus, getBody } = mockReqRes();
    notFound(req, res);
    expect(getStatus()).toBe(404);
    const parsed = JSON.parse(getBody());
    expect(parsed.error.message).toBe('Not Found');
  });
});
