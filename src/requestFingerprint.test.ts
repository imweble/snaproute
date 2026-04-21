import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import {
  generateFingerprint,
  requestFingerprint,
} from './requestFingerprint';
import {
  configureRequestFingerprint,
  resetRequestFingerprintConfig,
} from './requestFingerprint.config';

function mockReqRes(headers: Record<string, string> = {}, remoteAddress = '127.0.0.1') {
  const socket = { remoteAddress } as Socket;
  const req = Object.assign(new IncomingMessage(socket), { headers }) as IncomingMessage & Record<string, any>;
  const res = {
    setHeader: jest.fn(),
    getHeader: jest.fn(),
  } as unknown as ServerResponse;
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => resetRequestFingerprintConfig());

describe('generateFingerprint', () => {
  it('returns a 32-char hex string', () => {
    const { req } = mockReqRes({ 'user-agent': 'TestAgent/1.0' });
    const fp = generateFingerprint(req);
    expect(fp).toHaveLength(32);
    expect(fp).toMatch(/^[a-f0-9]+$/);
  });

  it('produces different fingerprints for different IPs', () => {
    const { req: req1 } = mockReqRes({}, '1.1.1.1');
    const { req: req2 } = mockReqRes({}, '2.2.2.2');
    expect(generateFingerprint(req1)).not.toBe(generateFingerprint(req2));
  });

  it('uses x-forwarded-for when present', () => {
    const { req } = mockReqRes({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' });
    const { req: req2 } = mockReqRes({}, '10.0.0.1');
    expect(generateFingerprint(req)).toBe(generateFingerprint(req2));
  });
});

describe('requestFingerprint middleware', () => {
  it('attaches fingerprint to req and sets header', () => {
    const { req, res, next } = mockReqRes({ 'user-agent': 'Mozilla/5.0' });
    requestFingerprint(req, res, next);
    expect(req.fingerprint).toBeDefined();
    expect(req.fingerprint).toHaveLength(32);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Fingerprint', req.fingerprint);
    expect(next).toHaveBeenCalledWith();
  });

  it('skips when disabled', () => {
    configureRequestFingerprint({ enabled: false });
    const { req, res, next } = mockReqRes();
    requestFingerprint(req, res, next);
    expect(req.fingerprint).toBeUndefined();
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('respects custom attachAs and headerName', () => {
    configureRequestFingerprint({ attachAs: 'clientId', headerName: 'X-Client-ID' });
    const { req, res, next } = mockReqRes();
    requestFingerprint(req, res, next);
    expect(req.clientId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Client-ID', req.clientId);
  });
});
