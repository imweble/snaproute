import { IncomingMessage, ServerResponse } from 'http';
import { getRequestContextConfig, isRequestContextEnabled } from './requestContext.config';

export type ContextMap = Record<string, unknown>;

const contextStore = new WeakMap<IncomingMessage, ContextMap>();

export function getContext(req: IncomingMessage): ContextMap {
  if (!contextStore.has(req)) {
    contextStore.set(req, {});
  }
  return contextStore.get(req)!;
}

export function setContext(req: IncomingMessage, key: string, value: unknown): void {
  const ctx = getContext(req);
  ctx[key] = value;
}

export function getContextValue<T = unknown>(req: IncomingMessage, key: string): T | undefined {
  return getContext(req)[key] as T | undefined;
}

export function clearContext(req: IncomingMessage): void {
  contextStore.set(req, {});
}

export function requestContext(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): void {
  if (!isRequestContextEnabled()) {
    return next();
  }

  const config = getRequestContextConfig();

  contextStore.set(req, {});

  if (config.seed) {
    const seeded = config.seed(req);
    const ctx = getContext(req);
    Object.assign(ctx, seeded);
  }

  next();
}
