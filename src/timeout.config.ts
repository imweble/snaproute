export type TimeoutConfig = {
  enabled: boolean;
  ms: number;
  message: string;
};

let config: TimeoutConfig = {
  enabled: true,
  ms: 5000,
  message: 'Request timed out',
};

export function configureTimeout(options: Partial<TimeoutConfig>): void {
  config = { ...config, ...options };
}

export function getTimeoutConfig(): TimeoutConfig {
  return { ...config };
}

export function isTimeoutEnabled(): boolean {
  return config.enabled;
}

export function resetTimeoutConfig(): void {
  config = {
    enabled: true,
    ms: 5000,
    message: 'Request timed out',
  };
}
