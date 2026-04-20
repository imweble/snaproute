import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';
import { bodyLimit } from './bodyLimit';
import { configureBodyLimit, resetBodyLimitConfig } from './bodyLimit.config';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = new EventEmitter() as IncomingMessage;
  Object.assign(req, { headers });
  const res = {
    writeHead: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;
  return { req, res };
}

afterEach(() => {
  resetBodyLimitConfig();
  jest.clearAllMocks();
});

test('calls next when body is within limit', (done) => {
  const { req, res } = mockReqRes();
  const mw = bodyLimit('10kb');
  mw(req, res, (err) => {
    expect(err).toBeUndefined();
    expect(res.writeHead).not.toHaveBeenCalled();
    done();
  });
  req.emit('data', Buffer.alloc(100));
  req.emit('end');
});

test('responds 413 when body exceeds limit', (done) => {
  const { req, res } = mockReqRes();
  const mw = bodyLimit('1b');
  mw(req, res, () => done.fail('next should not be called'));
  req.emit('data', Buffer.alloc(10));
  setImmediate(() => {
    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Payload Too Large' }));
    done();
  });
});

test('skips check when disabled', (done) => {
  configureBodyLimit({ enabled: false });
  const { req, res } = mockReqRes();
  const mw = bodyLimit('1b');
  mw(req, res, (err) => {
    expect(err).toBeUndefined();
    done();
  });
});

test('uses config limit when no override provided', (done) => {
  configureBodyLimit({ limit: '5b' });
  const { req, res } = mockReqRes();
  const mw = bodyLimit();
  mw(req, res, () => done.fail('next should not be called'));
  req.emit('data', Buffer.alloc(10));
  setImmediate(() => {
    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
    done();
  });
});
