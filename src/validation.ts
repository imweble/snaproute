import { IncomingMessage, ServerResponse } from 'http';

export type Schema = Record<string, {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}>;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBody(
  schema: Schema
) {
  return async (
    req: IncomingMessage & { body?: Record<string, unknown> },
    res: ServerResponse,
    next: () => void
  ) => {
    const body = (req as any).body ?? {};
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (value === undefined || value === null) continue;

      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push({ field, message: `${field} must be of type ${rules.type}` });
        continue;
      }

      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength)
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        if (rules.maxLength !== undefined && value.length > rules.maxLength)
          errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
      }

      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min)
          errors.push({ field, message: `${field} must be >= ${rules.min}` });
        if (rules.max !== undefined && value > rules.max)
          errors.push({ field, message: `${field} must be <= ${rules.max}` });
      }
    }

    if (errors.length > 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ errors }));
      return;
    }

    next();
  };
}
