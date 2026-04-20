export interface BodyLimitConfig {
  limit: string | number;
  enabled: boolean;
}

const defaultConfig: BodyLimitConfig = {
  limit: '1mb',
  enabled: true,
};

let currentConfig: BodyLimitConfig = { ...defaultConfig };

export function configureBodyLimit(options: Partial<BodyLimitConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getBodyLimitConfig(): BodyLimitConfig {
  return { ...currentConfig };
}

export function isBodyLimitEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetBodyLimitConfig(): void {
  currentConfig = { ...defaultConfig };
}
