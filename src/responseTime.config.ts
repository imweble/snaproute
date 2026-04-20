export interface ResponseTimeConfig {
  header: string;
  digits: number;
  enabled: boolean;
}

const defaultConfig: ResponseTimeConfig = {
  header: 'X-Response-Time',
  digits: 3,
  enabled: true,
};

let currentConfig: ResponseTimeConfig = { ...defaultConfig };

export function configureResponseTime(options: Partial<ResponseTimeConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getResponseTimeConfig(): ResponseTimeConfig {
  return { ...currentConfig };
}

export function isResponseTimeEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetResponseTimeConfig(): void {
  currentConfig = { ...defaultConfig };
}
