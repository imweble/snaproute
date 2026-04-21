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

/**
 * Configures the caching layer with the provided options.
 * Merges the given config with defaults and registers the cache middleware
 * if caching is enabled. Safe to call multiple times — duplicate middleware
 * registration is silently ignored.
 */
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

/**
 * Returns a shallow copy of the currently active cache configuration.
 */
export function getCacheConfig(): AppCacheConfig {
  return { ...activeConfig };
}

/**
 * Returns whether caching is currently enabled.
 */
export function isCachingEnabled(): boolean {
  return activeConfig.enabled;
}

/**
 * Resets the cache configuration back to the default values.
 * Useful for testing or when reinitialising the application.
 */
export function resetCacheConfig(): void {
  activeConfig = { ...defaultConfig };
}
