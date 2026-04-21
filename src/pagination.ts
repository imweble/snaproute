import { IncomingMessage, ServerResponse } from 'http';
import { getPaginationConfig, isPaginationEnabled } from './pagination.config';

export interface PaginationMeta {
  page: number;
  limit: number;
  offset: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function parsePaginationParams(
  query: Record<string, string | string[]>
): { page: number; limit: number; offset: number } {
  const config = getPaginationConfig();

  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const rawLimit = Array.isArray(query.limit) ? query.limit[0] : query.limit;

  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);
  const limit = Math.min(
    config.maxLimit,
    Math.max(1, parseInt(rawLimit ?? String(config.defaultLimit), 10) || config.defaultLimit)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export type Middleware = (
  req: IncomingMessage & { query?: Record<string, string | string[]>; pagination?: PaginationMeta },
  res: ServerResponse,
  next: (err?: unknown) => void
) => void;

export function pagination(): Middleware {
  return (req, _res, next) => {
    if (!isPaginationEnabled()) return next();

    const query = (req as any).query ?? {};
    const { page, limit, offset } = parsePaginationParams(query);
    (req as any).pagination = { page, limit, offset };
    next();
  };
}
