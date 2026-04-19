import { cacheMiddleware } from './cache';
import { registerMiddleware } from './middlewareRegistry';

export interface AppCacheConfig {
  enabled: boolean;
  ttl?: number;
  maxSize?: number;
  routes?: string[];
}

const defaultConfig: AppCacheConfig = {
  enabled: true,
  ttl: 10_000,
  maxSize: 500,
};

let activeConfig: AppCacheConfig = { ...defaultConfig };

export function configureCaching(config: Partial<AppCacheConfig> = {}): void {
  activeConfig = { ...defaultConfig, ...config };

  if (activeConfig.enabled) {
    try {
      registerMiddleware(
        'cache',
        cacheMiddleware({ ttl: activeConfig.ttl })
      );
    } catch {
      // already registered — skip
    }
  }
}

export function getCacheConfig(): AppCacheConfig {
  return { ...activeConfig };
}

export function isCachingEnabled(): boolean {
  return activeConfig.enabled;
}
