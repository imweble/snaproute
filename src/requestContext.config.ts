import { IncomingMessage } from 'http';

export interface RequestContextConfig {
  enabled: boolean;
  seed?: (req: IncomingMessage) => Record<string, unknown>;
}

const defaultConfig: RequestContextConfig = {
  enabled: true,
  seed: undefined,
};

let currentConfig: RequestContextConfig = { ...defaultConfig };

export function configureRequestContext(config: Partial<RequestContextConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getRequestContextConfig(): RequestContextConfig {
  return { ...currentConfig };
}

export function isRequestContextEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestContextConfig(): void {
  currentConfig = { ...defaultConfig };
}
