import { IncomingMessage, ServerResponse } from 'http';
import { ipFilter } from './ipFilter';
import { configureIpFilter, resetIpFilterConfig } from './ipFilter.config';

function mockReqRes(ip: string): [IncomingMessage, ServerResponse, jest.Mock] {
  const req = { headers: {}, socket: { remoteAddress: ip } } as unknown as IncomingMessage;
  const res = {
    writeHead: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;
  const next = jest.fn();
  return [req, res, next];
}

beforeEach(() => resetIpFilterConfig());

describe('ipFilter', () => {
  it('calls next when disabled', () => {
    configureIpFilter({ enabled: false });
    const [req, res, next] = mockReqRes('1.2.3.4');
    ipFilter()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows all IPs when no lists configured', () => {
    const [req, res, next] = mockReqRes('1.2.3.4');
    ipFilter()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks IP on denyList', () => {
    configureIpFilter({ denyList: ['1.2.3.4'] });
    const [req, res, next] = mockReqRes('1.2.3.4');
    ipFilter()(req, res, next);
    expect(res.writeHead).toHaveBeenCalledWith(403, expect.any(Object));
    expect(next).not.toHaveBeenCalled();
  });

  it('allows IP on allowList', () => {
    configureIpFilter({ allowList: ['1.2.3.4'] });
    const [req, res, next] = mockReqRes('1.2.3.4');
    ipFilter()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks IP not on allowList', () => {
    configureIpFilter({ allowList: ['1.2.3.4'] });
    const [req, res, next] = mockReqRes('9.9.9.9');
    ipFilter()(req, res, next);
    expect(res.writeHead).toHaveBeenCalledWith(403, expect.any(Object));
  });

  it('supports wildcard patterns in denyList', () => {
    configureIpFilter({ denyList: ['10.0.*'] });
    const [req, res, next] = mockReqRes('10.0.0.5');
    ipFilter()(req, res, next);
    expect(res.writeHead).toHaveBeenCalledWith(403, expect.any(Object));
  });
});
