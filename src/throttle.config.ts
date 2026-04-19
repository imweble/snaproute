interface ThrottleConfig {
  requestsPerSecond: number;
  maxQueue: number;
  enabled: boolean;
}

const defaultConfig: ThrottleConfig = {
  requestsPerSecond: 10,
  maxQueue: 5,
  enabled: true,
};

let currentConfig: ThrottleConfig = { ...defaultConfig };

export function configureThrottle(options: Partial<ThrottleConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getThrottleConfig(): ThrottleConfig {
  return { ...currentConfig };
}

export function isThrottlingEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetThrottleConfig(): void {
  currentConfig = { ...defaultConfig };
}
