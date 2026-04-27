import { IncomingMessage, ServerResponse } from 'http';
import { getRequestPriorityConfig, isRequestPriorityEnabled } from './requestPriority.config';

export type PriorityLevel = 'critical' | 'high' | 'normal' | 'low';

const PRIORITY_VALUES: Record<PriorityLevel, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export function parsePriority(value: string | undefined): PriorityLevel {
  if (value && value in PRIORITY_VALUES) {
    return value as PriorityLevel;
  }
  return 'normal';
}

export function getPriorityScore(level: PriorityLevel): number {
  return PRIORITY_VALUES[level] ?? PRIORITY_VALUES.normal;
}

export function requestPriority(
  defaultPriority: PriorityLevel = 'normal'
) {
  return function (req: IncomingMessage & Record<string, any>, res: ServerResponse, next: () => void) {
    if (!isRequestPriorityEnabled()) {
      return next();
    }

    const config = getRequestPriorityConfig();
    const headerValue = req.headers[config.header.toLowerCase()] as string | undefined;
    const priority = parsePriority(headerValue) ?? defaultPriority;

    req.priority = priority;
    req.priorityScore = getPriorityScore(priority);

    if (config.exposeHeader) {
      res.setHeader('X-Request-Priority', priority);
    }

    next();
  };
}
