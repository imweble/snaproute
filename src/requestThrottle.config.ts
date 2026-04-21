interface RequestThrottleConfig {
  rate: number;   // tokens per second
  burst: number;  // max burst size
  enabled: boolean;
}

const defaultConfig: RequestThrottleConfig = {
  rate: 10,
  burst: 20,
  enabled: true,
};

let currentConfig: RequestThrottleConfig = { ...defaultConfig };

export function configureRequestThrottle(options: Partial<RequestThrottleConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getRequestThrottleConfig(): RequestThrottleConfig {
  return { ...currentConfig };
}

export function isRequestThrottleEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestThrottleConfig(): void {
  currentConfig = { ...defaultConfig };
}
