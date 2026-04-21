export interface RequestSizeConfig {
  maxSize: string | number;
  enabled: boolean;
}

const defaultConfig: RequestSizeConfig = {
  maxSize: '1mb',
  enabled: true,
};

let currentConfig: RequestSizeConfig = { ...defaultConfig };

export function configureRequestSize(options: Partial<RequestSizeConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getRequestSizeConfig(): RequestSizeConfig {
  return { ...currentConfig };
}

export function isRequestSizeEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestSizeConfig(): void {
  currentConfig = { ...defaultConfig };
}
