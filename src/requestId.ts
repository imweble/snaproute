import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { getRequestIdConfig } from './requestId.config';

export type NextFunction = (err?: any) => void;

export function generateRequestId(): string {
  return randomUUID();
}

export function requestId(
  req: IncomingMessage & { requestId?: string },
  res: ServerResponse,
  next: NextFunction
): void {
  const config = getRequestIdConfig();

  if (!config.enabled) {
    return next();
  }

  const incomingHeader = config.requestHeader
    ? (req.headers[config.requestHeader.toLowerCase()] as string | undefined)
    : undefined;

  const id = incomingHeader ?? generateRequestId();

  req.requestId = id;

  if (config.responseHeader) {
    res.setHeader(config.responseHeader, id);
  }

  next();
}
