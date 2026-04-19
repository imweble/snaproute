import { IncomingMessage, ServerResponse } from 'http';
import { sanitize } from './sanitize';
import { configureSanitize, resetSanitizeConfig } from './sanitize.config';

function mockReqRes(body?: any): [
  IncomingMessage & { body?: any },
  ServerResponse,
  jest.Mock
] {
  const req = { body } as IncomingMessage & { body?: any };
  const res = {} as ServerResponse;
  const next = jest.fn();
  return [req, res, next];
}

afterEach(() => resetSanitizeConfig());

describe('sanitize', () => {
  it('calls next when no body', () => {
    const [req, res, next] = mockReqRes();
    sanitize()(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('escapes html in string values', () => {
    const [req, res, next] = mockReqRes({ name: '<script>alert(1)</script>' });
    sanitize()(req, res, next);
    expect(req.body.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(next).toHaveBeenCalled();
  });

  it('sanitizes nested objects', () => {
    const [req, res, next] = mockReqRes({ user: { bio: '<b>hello</b>' } });
    sanitize()(req, res, next);
    expect(req.body.user.bio).toBe('&lt;b&gt;hello&lt;/b&gt;');
  });

  it('sanitizes arrays', () => {
    const [req, res, next] = mockReqRes({ tags: ['<a>', 'safe'] });
    sanitize()(req, res, next);
    expect(req.body.tags[0]).toBe('&lt;a&gt;');
    expect(req.body.tags[1]).toBe('safe');
  });

  it('skips sanitization when disabled', () => {
    configureSanitize({ enabled: false });
    const [req, res, next] = mockReqRes({ name: '<b>hi</b>' });
    sanitize()(req, res, next);
    expect(req.body.name).toBe('<b>hi</b>');
    expect(next).toHaveBeenCalled();
  });

  it('leaves non-string primitives unchanged', () => {
    const [req, res, next] = mockReqRes({ count: 42, active: true });
    sanitize()(req, res, next);
    expect(req.body.count).toBe(42);
    expect(req.body.active).toBe(true);
  });
});
