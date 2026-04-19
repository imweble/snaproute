import type { Handler } from './router';

type MiddlewareName = string;

const registry = new Map<MiddlewareName, Handler>();

export function registerMiddleware(name: MiddlewareName, handler: Handler): void {
  if (registry.has(name)) {
    throw new Error(`Middleware "${name}" is already registered.`);
  }
  registry.set(name, handler);
}

export function getMiddleware(name: MiddlewareName): Handler {
  const handler = registry.get(name);
  if (!handler) {
    throw new Error(`Middleware "${name}" not found in registry.`);
  }
  return handler;
}

export function unregisterMiddleware(name: MiddlewareName): void {
  registry.delete(name);
}

export function listMiddleware(): MiddlewareName[] {
  return Array.from(registry.keys());
}

export function clearRegistry(): void {
  registry.clear();
}

export function resolveMiddlewares(names: MiddlewareName[]): Handler[] {
  return names.map(getMiddleware);
}
