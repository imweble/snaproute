export interface KeepAliveConfig {
  enabled: boolean;
  timeout: number;
  maxRequests: number;
}

const defaultConfig: KeepAliveConfig = {
  enabled: true,
  timeout: 5,
  maxRequests: 1000,
};

let currentConfig: KeepAliveConfig = { ...defaultConfig };

export function configureKeepAlive(options: Partial<KeepAliveConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getKeepAliveConfig(): KeepAliveConfig {
  return { ...currentConfig };
}

export function isKeepAliveEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetKeepAliveConfig(): void {
  currentConfig = { ...defaultConfig };
}
