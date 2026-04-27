import { IncomingMessage, ServerResponse } from 'http';
import {
  requestContext,
  getContext,
  setContext,
  getContextValue,
  clearContext,
} from './requestContext';
import {
  configureRequestContext,
  resetRequestContextConfig,
} from './requestContext.config';

function mockReqRes() {
  const req = new IncomingMessage(null as any);
  const res = new ServerResponse(req);
  return { req, res };
}

beforeEach(() => {
  resetRequestContextConfig();
});

test('initializes empty context on request', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(getContext(req)).toEqual({});
});

test('setContext and getContextValue work correctly', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  setContext(req, 'userId', 42);
  expect(getContextValue<number>(req, 'userId')).toBe(42);
});

test('clearContext resets the context map', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  setContext(req, 'foo', 'bar');
  clearContext(req);
  expect(getContextValue(req, 'foo')).toBeUndefined();
});

test('seed function populates initial context', () => {
  configureRequestContext({ seed: () => ({ role: 'admin' }) });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  expect(getContextValue(req, 'role')).toBe('admin');
});

test('skips middleware when disabled', () => {
  configureRequestContext({ enabled: false });
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(getContext(req)).toEqual({});
});

test('getContextValue returns undefined for missing key', () => {
  const { req, res } = mockReqRes();
  const next = jest.fn();
  requestContext(req, res, next);
  expect(getContextValue(req, 'missing')).toBeUndefined();
});
