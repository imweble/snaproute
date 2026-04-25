export interface TrustedProxyConfig {
  enabled: boolean;
  trusted: string[];
  depth: number;
}

const DEFAULT_CONFIG: TrustedProxyConfig = {
  enabled: true,
  trusted: ['127.0.0.1', '::1'],
  depth: 1,
};

let config: TrustedProxyConfig = { ...DEFAULT_CONFIG };

export function configureTrustedProxy(options: Partial<TrustedProxyConfig>): void {
  config = { ...config, ...options };
  if (options.trusted !== undefined) {
    config.trusted = options.trusted;
  }
}

export function getTrustedProxyConfig(): TrustedProxyConfig {
  return { ...config };
}

export function isTrustedProxyEnabled(): boolean {
  return config.enabled;
}

export function resetTrustedProxyConfig(): void {
  config = { ...DEFAULT_CONFIG };
}
