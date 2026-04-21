import { IncomingMessage, ServerResponse } from 'http';
import { contentType, matchesType } from './contentType';
import { resetContentTypeConfig, configureContentType } from './contentType.config';

function mockReqRes(
  method = 'POST',
  ct?: string
): { req: Partial<IncomingMessage>; res: Partial<ServerResponse> & { _status?: number; _body?: string } } {
  const headers: Record<string, string> = {};
  if (ct) headers['content-type'] = ct;
  const res: any = {
    _status: 200,
    _body: '',
    writeHead(status: number) { this._status = status; },
    end(body: string) { this._body = body; },
  };
  return { req: { method, headers }, res };
}

describe('matchesType', () => {
  it('matches exact type', () => {
    expect(matchesType('application/json', ['application/json'])).toBe(true);
  });
  it('matches wildcard', () => {
    expect(matchesType('image/png', ['image/*'])).toBe(true);
  });
  it('ignores charset param', () => {
    expect(matchesType('application/json; charset=utf-8', ['application/json'])).toBe(true);
  });
  it('returns false for unmatched', () => {
    expect(matchesType('text/plain', ['application/json'])).toBe(false);
  });
});

describe('contentType middleware', () => {
  afterEach(() => resetContentTypeConfig());

  it('calls next for GET requests', () => {
    const { req, res } = mockReqRes('GET');
    const next = jest.fn();
    contentType()(req as IncomingMessage, res as ServerResponse, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows matching content-type', () => {
    const { req, res } = mockReqRes('POST', 'application/json');
    const next = jest.fn();
    contentType(['application/json'])(req as IncomingMessage, res as ServerResponse, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects unsupported content-type', () => {
    const { req, res } = mockReqRes('POST', 'text/plain') as any;
    const next = jest.fn();
    contentType(['application/json'])(req, res, next);
    expect(res._status).toBe(415);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects missing content-type in strict mode', () => {
    const { req, res } = mockReqRes('POST') as any;
    const next = jest.fn();
    contentType(['application/json'], { strict: true })(req, res, next);
    expect(res._status).toBe(415);
  });

  it('skips when disabled', () => {
    configureContentType({ enabled: false });
    const { req, res } = mockReqRes('POST', 'text/plain') as any;
    const next = jest.fn();
    contentType(['application/json'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
