import { IncomingMessage, ServerResponse } from 'http';
import { requestId, generateRequestId } from './requestId';
import {
  configureRequestId,
  resetRequestIdConfig,
} from './requestId.config';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = {
    headers,
    requestId: undefined as string | undefined,
  } as unknown as IncomingMessage & { requestId?: string };

  const resHeaders: Record<string, string> = {};
  const res = {
    setHeader: (key: string, value: string) => {
      resHeaders[key] = value;
    },
    getHeaders: () => resHeaders,
  } as unknown as ServerResponse;

  return { req, res, resHeaders };
}

beforeEach(() => resetRequestIdConfig());

describe('generateRequestId', () => {
  it('returns a UUID string', () => {
    const id = generateRequestId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});

describe('requestId middleware', () => {
  it('assigns a new requestId when none is present', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    requestId(req, res, next);
    expect(req.requestId).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('reuses an existing id from the request header', () => {
    const.requestId).toBe('my-custom-id');
  });

  it('sets the response header', () => {
    const { req, res, resHeaders } = mockReqRes();
    const next = jest.fn();
    requestId(req, res, next);
    expect(resHeaders['x-request-id']).toBe(req.requestId);
  });

  it('skips when disabled', () => {
    configureRequestId({ enabled: false });
    const { req, res } = mockReqRes();
    const next = jest.fn();
    requestId(req, res, next);
    expect(req.requestId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('does not set response header when responseHeader is null', () => {
    configureRequestId({ responseHeader: null });
    const { req, res, resHeaders } = mockReqRes();
    const next = jest.fn();
    requestId(req, res, next);
    expect(req.requestId).toBeDefined();
    expect(resHeaders['x-request-id']).toBeUndefined();
  });
});
