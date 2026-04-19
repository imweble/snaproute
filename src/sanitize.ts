import { IncomingMessage, ServerResponse } from 'http';
import { getSanitizeConfig } from './sanitize.config';

export type Middleware = (
  req: IncomingMessage & { body?: any },
  res: ServerResponse,
  next: (err?: any) => void
) => void;

function sanitizeValue(value: any, depth = 0): any {
  if (depth > 10) return value;
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  if (Array.isArray(value)) {
    return value.map( => sanitizeValue(v,value !==object') {
    const<string, any> = {};
    for (const key Object.keys(value)) {
      result[key] = sanitizeValue(value[key], depth + 1);
    }
    return result;
  }
  return value;
}

export const sanitize = (): Middleware => {
  return (req, res, next) => {
    const config = getSanitizeConfig();
    if (!config.enabled) return next();

    if (req.body !== undefined) {
      try {
        req.body = sanitizeValue(req.body);
      } catch {
        return next();
      }
    }
    next();
  };
};
