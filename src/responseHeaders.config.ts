import { HeadersMap } from './responseHeaders';

export interface ResponseHeadersConfig {
  enabled: boolean;
  headers: HeadersMap;
}

const defaultConfig: ResponseHeadersConfig = {
  enabled: true,
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
  },
};

let currentConfig: ResponseHeadersConfig = { ...defaultConfig, headers: { ...defaultConfig.headers } };

export function configureResponseHeaders(options: Partial<ResponseHeadersConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...options,
    headers: {
      ...currentConfig.headers,
      ...(options.headers ?? {}),
    },
  };
}

export function getResponseHeadersConfig(): ResponseHeadersConfig {
  return currentConfig;
}

export function isResponseHeadersEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetResponseHeadersConfig(): void {
  currentConfig = { ...defaultConfig, headers: { ...defaultConfig.headers } };
}
