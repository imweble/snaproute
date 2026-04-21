import { IncomingMessage, ServerResponse } from 'http';
import { parsePaginationParams, buildPaginationMeta, pagination } from './pagination';
import { configurePagination, resetPaginationConfig } from './pagination.config';

beforeEach(() => resetPaginationConfig());

function mockReqRes(query: Record<string, string> = {}) {
  const req = { query } as any;
  const res = {} as ServerResponse;
  return { req, res };
}

describe('parsePaginationParams', () => {
  it('returns defaults when no query params', () => {
    const result = parsePaginationParams({});
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('parses page and limit from query', () => {
    const result = parsePaginationParams({ page: '3', limit: '10' });
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('clamps limit to maxLimit', () => {
    const result = parsePaginationParams({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('clamps page to minimum 1', () => {
    const result = parsePaginationParams({ page: '-5' });
    expect(result.page).toBe(1);
  });

  it('respects custom defaultLimit from config', () => {
    configurePagination({ defaultLimit: 5 });
    const result = parsePaginationParams({});
    expect(result.limit).toBe(5);
  });
});

describe('buildPaginationMeta', () => {
  it('builds correct meta', () => {
    const meta = buildPaginationMeta(2, 10, 35);
    expect(meta.total).toBe(35);
    expect(meta.totalPages).toBe(4);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
  });

  it('hasNext is false on last page', () => {
    const meta = buildPaginationMeta(4, 10, 35);
    expect(meta.hasNext).toBe(false);
  });
});

describe('pagination middleware', () => {
  it('attaches pagination to req', () => {
    const { req, res } = mockReqRes({ page: '2', limit: '5' });
    const next = jest.fn();
    pagination()(req, res, next);
    expect(req.pagination).toEqual({ page: 2, limit: 5, offset: 5 });
    expect(next).toHaveBeenCalled();
  });

  it('skips when disabled', () => {
    configurePagination({ enabled: false });
    const { req, res } = mockReqRes({ page: '2' });
    const next = jest.fn();
    pagination()(req, res, next);
    expect(req.pagination).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
