export interface RequestFingerprintConfig {
  enabled: boolean;
  useIp: boolean;
  useUserAgent: boolean;
  useAcceptLanguage: boolean;
  useAccept: boolean;
  attachAs: string;
  headerName: string;
}

const defaultConfig: RequestFingerprintConfig = {
  enabled: true,
  useIp: true,
  useUserAgent: true,
  useAcceptLanguage: true,
  useAccept: false,
  attachAs: 'fingerprint',
  headerName: 'X-Request-Fingerprint',
};

let currentConfig: RequestFingerprintConfig = { ...defaultConfig };

export function configureRequestFingerprint(options: Partial<RequestFingerprintConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getRequestFingerprintConfig(): RequestFingerprintConfig {
  return { ...currentConfig };
}

export function isRequestFingerprintEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestFingerprintConfig(): void {
  currentConfig = { ...defaultConfig };
}
