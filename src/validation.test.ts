import { validateBody, Schema } from './validation';
import { IncomingMessage, ServerResponse } from 'http';

function mockReqRes(body?: Record<string, unknown>) {
  const req = { body } as IncomingMessage & { body?: Record<string, unknown> };
  const chunks: Buffer[] = [];
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    writeHead(code: number, headers?: Record<string, string>) {
      this.statusCode = code;
      if (headers) this.headers = { ...this.headers, ...headers };
    },
    end(data?: string) { this._body = data; },
    _body: '' as string | undefined,
  } as unknown as ServerResponse & { _body?: string };
  return { req, res };
}

describe('validateBody', () => {
  const schema: Schema = {
    name: { type: 'string', required: true, minLength: 2, maxLength: 20 },
    age: { type: 'number', required: false, min: 0, max: 120 },
  };

  it('calls next when body is valid', async () => {
    const { req, res } = mockReqRes({ name: 'Alice', age: 30 });
    const next = jest.fn();
    await validateBody(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when required field is missing', async () => {
    const { req, res } = mockReqRes({ age: 25 });
    const next = jest.fn();
    await validateBody(schema)(req, res, next);
    expect((res as any).statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
    const parsed = JSON.parse((res as any)._body);
    expect(parsed.errors[0].field).toBe('name');
  });

  it('returns 400 for wrong type', async () => {
    const { req, res } = mockReqRes({ name: 123 });
    const next = jest.fn();
    await validateBody(schema)(req, res, next);
    expect((res as any).statusCode).toBe(400);
  });

  it('returns 400 when string is too short', async () => {
    const { req, res } = mockReqRes({ name: 'A' });
    const next = jest.fn();
    await validateBody(schema)(req, res, next);
    expect((res as any).statusCode).toBe(400);
    const parsed = JSON.parse((res as any)._body);
    expect(parsed.errors[0].message).toMatch(/at least 2/);
  });

  it('returns 400 when number is out of range', async () => {
    const { req, res } = mockReqRes({ name: 'Alice', age: 200 });
    const next = jest.fn();
    await validateBody(schema)(req, res, next);
    expect((res as any).statusCode).toBe(400);
  });
});
