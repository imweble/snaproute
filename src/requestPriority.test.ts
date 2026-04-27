import { IncomingMessage, ServerResponse } from 'http';
import { requestPriority, parsePriority, getPriorityScore } from './requestPriority';
import { configureRequestPriority, resetRequestPriorityConfig } from './requestPriority.config';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = { headers, priority: undefined, priorityScore: undefined } as any;
  const res = {
    setHeader: jest.fn(),
  } as any;
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => {
  resetRequestPriorityConfig();
});

describe('parsePriority', () => {
  it('returns valid priority levels', () => {
    expect(parsePriority('critical')).toBe('critical');
    expect(parsePriority('high')).toBe('high');
    expect(parsePriority('low')).toBe('low');
    expect(parsePriority('normal')).toBe('normal');
  });

  it('falls back to normal for unknown values', () => {
    expect(parsePriority('unknown')).toBe('normal');
    expect(parsePriority(undefined)).toBe('normal');
  });
});

describe('getPriorityScore', () => {
  it('returns correct numeric scores', () => {
    expect(getPriorityScore('critical')).toBe(4);
    expect(getPriorityScore('high')).toBe(3);
    expect(getPriorityScore('normal')).toBe(2);
    expect(getPriorityScore('low')).toBe(1);
  });
});

describe('requestPriority middleware', () => {
  it('sets priority from header', () => {
    const { req, res, next } = mockReqRes({ 'x-priority': 'high' });
    requestPriority()(req, res, next);
    expect(req.priority).toBe('high');
    expect(req.priorityScore).toBe(3);
    expect(next).toHaveBeenCalled();
  });

  it('defaults to normal when no header present', () => {
    const { req, res, next } = mockReqRes();
    requestPriority()(req, res, next);
    expect(req.priority).toBe('normal');
    expect(req.priorityScore).toBe(2);
  });

  it('exposes priority header when configured', () => {
    configureRequestPriority({ exposeHeader: true });
    const { req, res, next } = mockReqRes({ 'x-priority': 'critical' });
    requestPriority()(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Priority', 'critical');
  });

  it('skips middleware when disabled', () => {
    configureRequestPriority({ enabled: false });
    const { req, res, next } = mockReqRes({ 'x-priority': 'high' });
    requestPriority()(req, res, next);
    expect(req.priority).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('uses custom header name from config', () => {
    configureRequestPriority({ header: 'X-Custom-Priority' });
    const { req, res, next } = mockReqRes({ 'x-custom-priority': 'low' });
    requestPriority()(req, res, next);
    expect(req.priority).toBe('low');
    expect(req.priorityScore).toBe(1);
  });
});
