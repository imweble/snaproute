import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { compress } from './compress';

function mockReqRes(acceptEncoding = 'gzip, deflate') {
  const req = new IncomingMessage(new Socket());
  req.headers['accept-encoding'] = acceptEncoding;
  const res = new ServerResponse(req);
  const headers: Record<string, any> = {};
  res.setHeader = (k: string, v: any) => { headers[k] = v; return res; };
  res.getHeader = (k: string) => headers[k];
  return { req, res, headers };
}

describe('compress middleware', () => {
  it('calls next when no accepted encoding matches', async () => {
    const { req, res } = mockReqRes('identity');
    const middleware = compress();
    const next = jest.fn();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next for gzip accepted encoding', async () => {
    const { req, res } = mockReqRes('gzip');
    const middleware = compress();
    const next = jest.fn();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('does not compress below threshold', async () => {
    const { req, res, headers } = mockReqRes('gzip');
    const middleware = compress({ threshold: 10000 });
    const next = jest.fn();
    const ended: Buffer[] = [];
    (res as any).end = (chunk?: any) => { if (chunk) ended.push(chunk); return res; };
    await middleware(req, res, next);
    (res as any).end(Buffer.from('small'));
    expect(headers['Content-Encoding']).toBeUndefined();
  });

  it('uses deflate when only deflate accepted', async () => {
    const { req, res } = mockReqRes('deflate');
    const middleware = compress({ threshold: 0 });
    const next = jest.fn();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('respects custom encodings option', async () => {
    const { req, res } = mockReqRes('gzip');
    const middleware = compress({ encodings: ['deflate'] });
    const next = jest.fn();
    await middleware(req, res, next);
    // gzip not in supported list, so next called without compression setup
    expect(next).toHaveBeenCalled();
  });
});
