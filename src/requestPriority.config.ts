export interface RequestPriorityConfig {
  enabled: boolean;
  header: string;
  exposeHeader: boolean;
}

const defaultConfig: RequestPriorityConfig = {
  enabled: true,
  header: 'X-Priority',
  exposeHeader: false,
};

let currentConfig: RequestPriorityConfig = { ...defaultConfig };

export function configureRequestPriority(config: Partial<RequestPriorityConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getRequestPriorityConfig(): RequestPriorityConfig {
  return { ...currentConfig };
}

export function isRequestPriorityEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestPriorityConfig(): void {
  currentConfig = { ...defaultConfig };
}
