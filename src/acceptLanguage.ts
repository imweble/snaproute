import { IncomingMessage, ServerResponse } from 'http';

export type Middleware = (
  req: IncomingMessage & { [key: string]: any },
  res: ServerResponse,
  next: (err?: any) => void
) => void;

export interface ParsedLanguage {
  lang: string;
  quality: number;
}

export function parseAcceptLanguage(header: string): ParsedLanguage[] {
  return header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return {
        lang: lang.trim(),
        quality: q !== undefined ? parseFloat(q) : 1.0,
      };
    })
    .filter((p) => !isNaN(p.quality))
    .sort((a, b) => b.quality - a.quality);
}

export function getBestLanguage(
  accepted: ParsedLanguage[],
  supported: string[]
): string | null {
  for (const { lang } of accepted) {
    const exact = supported.find(
      (s) => s.toLowerCase() === lang.toLowerCase()
    );
    if (exact) return exact;

    const base = lang.split('-')[0].toLowerCase();
    const partial = supported.find(
      (s) => s.split('-')[0].toLowerCase() === base
    );
    if (partial) return partial;
  }
  return null;
}

export function acceptLanguage(
  supported: string[],
  defaultLanguage = 'en'
): Middleware {
  return (req, _res, next) => {
    const header = req.headers['accept-language'] || '';
    const parsed = header ? parseAcceptLanguage(header) : [];
    const best = parsed.length
      ? getBestLanguage(parsed, supported)
      : null;
    req.language = best ?? defaultLanguage;
    next();
  };
}
