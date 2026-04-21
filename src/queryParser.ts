import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'querystring';

export type ParsedQuery = Record<string, string | string[] | undefined>;

export interface QueryParserOptions {
  parseArrays?: boolean;
  parseBooleans?: boolean;
  parseNumbers?: boolean;
}

const defaultOptions: QueryParserOptions = {
  parseArrays: true,
  parseBooleans: true,
  parseNumbers: true,
};

export function parseValue(value: string, options: QueryParserOptions): unknown {
  if (options.parseBooleans) {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  if (options.parseNumbers) {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') return num;
  }
  return value;
}

export function parseQuery(
  queryString: string,
  options: QueryParserOptions = defaultOptions
): Record<string, unknown> {
  const raw = parse(queryString);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      result[key] = options.parseArrays
        ? value.map((v) => parseValue(v, options))
        : value.map((v) => String(v));
    } else if (value !== undefined) {
      result[key] = parseValue(value, options);
    }
  }

  return result;
}

export function queryParser(
  options: QueryParserOptions = defaultOptions
) {
  return function (
    req: IncomingMessage & { query?: Record<string, unknown> },
    _res: ServerResponse,
    next: () => void
  ): void {
    const url = req.url ?? '';
    const queryIndex = url.indexOf('?');
    const queryString = queryIndex !== -1 ? url.slice(queryIndex + 1) : '';
    req.query = parseQuery(queryString, { ...defaultOptions, ...options });
    next();
  };
}
