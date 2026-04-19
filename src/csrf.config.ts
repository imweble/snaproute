export interface CsrfConfig {
  enabled: boolean;
  headerName: string;
  ttl: number; // ms
}

const defaults: CsrfConfig = {
  enabled: true,
  headerName: 'X-CSRF-Token',
  ttl: 3600_000,
};

let config: CsrfConfig = { ...defaults };

export function configureCsrf(options: Partial<CsrfConfig>): void {
  config = { ...config, ...options };
}

export function getCsrfConfig(): CsrfConfig {
  return config;
}

export function isCsrfEnabled(): boolean {
  return config.enabled;
}

export function resetCsrfConfig(): void {
  config = { ...defaults };
}
