interface ResponseCacheConfig {
  enabled: boolean;
  ttl: number;
  methods: string[];
}

const defaultConfig: ResponseCacheConfig = {
  enabled: true,
  ttl: 60,
  methods: ['GET', 'HEAD'],
};

let currentConfig: ResponseCacheConfig = { ...defaultConfig };

export function configureResponseCache(options: Partial<ResponseCacheConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getResponseCacheConfig(): ResponseCacheConfig {
  return { ...currentConfig };
}

export function isResponseCacheEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetResponseCacheConfig(): void {
  currentConfig = { ...defaultConfig };
}
