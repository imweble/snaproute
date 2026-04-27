import { IncomingMessage, ServerResponse } from 'http';
import { vary, appendVary } from './vary';

function mockReqRes(): { req: IncomingMessage; res: ServerResponse } {
  const req = {} as IncomingMessage;
  const headers: Record<string, string | string[]> = {};
  const res = {
    getHeader: (name: string) => headers[name.toLowerCase()],
    setHeader: (name: string, value: string | string[]) => {
      headers[name.toLowerCase()] = value;
    },
  } as unknown as ServerResponse;
  return { req, res };
}

describe('appendVary', () => {
  it('sets Vary header when none exists', () => {
    const { res } = mockReqRes();
    appendVary(res, 'Accept-Encoding');
    expect(res.getHeader('Vary')).toBe('Accept-Encoding');
  });

  it('appends a new field to existing Vary header', () => {
    const { res } = mockReqRes();
    appendVary(res, 'Accept-Encoding');
    appendVary(res, 'Accept-Language');
    expect(res.getHeader('Vary')).toBe('Accept-Encoding, Accept-Language');
  });

  it('does not duplicate existing fields (case-insensitive)', () => {
    const { res } = mockReqRes();
    appendVary(res, 'Accept-Encoding');
    appendVary(res, 'accept-encoding');
    expect(res.getHeader('Vary')).toBe('Accept-Encoding');
  });

  it('sets Vary to * and ignores further additions', () => {
    const { res } = mockReqRes();
    appendVary(res, '*');
    appendVary(res, 'Accept');
    expect(res.getHeader('Vary')).toBe('*');
  });

  it('does nothing when field is empty string', () => {
    const { res } = mockReqRes();
    appendVary(res, '');
    expect(res.getHeader('Vary')).toBeUndefined();
  });
});

describe('vary middleware', () => {
  it('throws if no fields provided', () => {
    expect(() => vary()).toThrow(TypeError);
  });

  it('calls next after setting Vary header', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    vary('Accept-Encoding')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.getHeader('Vary')).toBe('Accept-Encoding');
  });

  it('handles multiple fields passed as separate arguments', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    vary('Accept', 'Accept-Language')(req, res, next);
    expect(res.getHeader('Vary')).toBe('Accept, Accept-Language');
  });

  it('handles comma-separated fields in a single argument', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    vary('Accept, Accept-Encoding')(req, res, next);
    expect(res.getHeader('Vary')).toBe('Accept, Accept-Encoding');
  });
});
