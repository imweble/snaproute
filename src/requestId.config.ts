export interface RequestIdConfig {
  enabled: boolean;
  /** Incoming request header to read an existing ID from (e.g. 'x-request-id') */
  requestHeader: string | null;
  /** Response header to echo the ID back on (e.g. 'x-request-id') */
  responseHeader: string | null;
}

const defaultConfig: RequestIdConfig = {
  enabled: true,
  requestHeader: 'x-request-id',
  responseHeader: 'x-request-id',
};

let currentConfig: RequestIdConfig = { ...defaultConfig };

export function configureRequestId(options: Partial<RequestIdConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getRequestIdConfig(): RequestIdConfig {
  return { ...currentConfig };
}

export function isRequestIdEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestIdConfig(): void {
  currentConfig = { ...defaultConfig };
}
