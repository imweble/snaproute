export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
}

const defaultConfig: HealthCheckConfig = {
  enabled: true,
  path: '/health',
};

let currentConfig: HealthCheckConfig = { ...defaultConfig };

export function configureHealthCheck(options: Partial<HealthCheckConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getHealthCheckConfig(): HealthCheckConfig {
  return { ...currentConfig };
}

export function isHealthCheckEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetHealthCheckConfig(): void {
  currentConfig = { ...defaultConfig };
}
