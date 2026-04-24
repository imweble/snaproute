import { IncomingMessage, ServerResponse } from 'http';
import { requestDedup, clearDedupStore, getDedupKey } from './requestDedup';
import { configureRequestDedup, resetRequestDedupConfig } from './requestDedup.config';

function mockReqRes(method = 'POST', url = '/api/data') {
  const req = Object.assign(new IncomingMessage(null as any), { method, url }) as IncomingMessage;
  const res = new ServerResponse(req);
  const chunks: Buffer[] = [];
  res.write = (chunk: any) => { chunks.push(Buffer.from(chunk)); return true; };
  res.end = (chunk?: any) => { if (chunk) chunks.push(Buffer.from(chunk)); return res; } as any;
  return { req, res, getBody: () => Buffer.concat(chunks).toString() };
}

beforeEach(() => {
  clearDedupStore();
  resetRequestDedupConfig();
});

describe('requestDedup', () => {
  it('calls next for non-duplicate requests', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    requestDedup()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks duplicate in-flight requests', () => {
    const { req: req1, res: res1 } = mockReqRes();
    const { req: req2, res: res2 } = mockReqRes();
    const next1 = jest.fn();
    const next2 = jest.fn();

    requestDedup()(req1, res1, next1);
    requestDedup()(req2, res2, next2);

    expect(next1).toHaveBeenCalled();
    expect(next2).not.toHaveBeenCalled();
    expect(res2.statusCode).toBe(429);
  });

  it('passes through GET requests by default', () => {
    const { req, res } = mockReqRes('GET', '/api/data');
    const next = jest.fn();
    requestDedup()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('skips dedup when disabled', () => {
    configureRequestDedup({ enabled: false });
    const { req: req1, res: res1 } = mockReqRes();
    const { req: req2, res: res2 } = mockReqRes();
    const next1 = jest.fn();
    const next2 = jest.fn();
    requestDedup()(req1, res1, next1);
    requestDedup()(req2, res2, next2);
    expect(next1).toHaveBeenCalled();
    expect(next2).toHaveBeenCalled();
  });

  it('uses custom keyFn when provided', () => {
    configureRequestDedup({ keyFn: () => 'static-key' });
    const { req } = mockReqRes();
    expect(getDedupKey(req)).toBe('static-key');
  });

  it('clears store after response finishes', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    requestDedup()(req, res, next);
    res.emit('finish');

    const { req: req2, res: res2 } = mockReqRes();
    const next2 = jest.fn();
    requestDedup()(req2, res2, next2);
    expect(next2).toHaveBeenCalled();
  });
});
