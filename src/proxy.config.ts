export type ProxyConfig = {
  enabled: boolean;
  timeout: number;
};

const defaultConfig: ProxyConfig = {
  enabled: true,
  timeout: 10000,
};

let currentConfig: ProxyConfig = { ...defaultConfig };

export function configureProxy(options: Partial<ProxyConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getProxyConfig(): ProxyConfig {
  return { ...currentConfig };
}

export function isProxyEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetProxyConfig(): void {
  currentConfig = { ...defaultConfig };
}
