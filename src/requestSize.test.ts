import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';
import { requestSize, parseSize } from './requestSize';
import { configureRequestSize, resetRequestSizeConfig } from './requestSize.config';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = Object.assign(new EventEmitter(), {
    headers,
    destroy: jest.fn(),
  }) as unknown as IncomingMessage;
  const res = {
    writeHead: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res };
}

describe('parseSize', () => {
  it('parses bytes', () => expect(parseSize('500b')).toBe(500));
  it('parses kilobytes', () => expect(parseSize('2kb')).toBe(2048));
  it('parses megabytes', () => expect(parseSize('1mb')).toBe(1048576));
  it('handles numbers', () => expect(parseSize(1024)).toBe(1024));
  it('throws on invalid format', () => expect(() => parseSize('abc')).toThrow());
});

describe('requestSize middleware', () => {
  afterEach(() => resetRequestSizeConfig());

  it('calls next when content-length is within limit', () => {
    const { req, res } = mockReqRes({ 'content-length': '100' });
    const next = jest.fn();
    requestSize('1kb')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.writeHead).not.toHaveBeenCalled();
  });

  it('rejects request when content-length exceeds limit', () => {
    const { req, res } = mockReqRes({ 'content-length': '2048' });
    const next = jest.fn();
    requestSize('1kb')(req, res, next);
    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
    expect(res.end).toHaveBeenCalled();
  });

  it('skips check when disabled', () => {
    configureRequestSize({ enabled: false });
    const { req, res } = mockReqRes({ 'content-length': '999999' });
    const next = jest.fn();
    requestSize('1b')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.writeHead).not.toHaveBeenCalled();
  });

  it('uses global config maxSize when no argument provided', () => {
    configureRequestSize({ maxSize: '10b' });
    const { req, res } = mockReqRes({ 'content-length': '100' });
    const next = jest.fn();
    requestSize()(req, res, next);
    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
  });
});
