export interface HstsOptions {
  maxAge: number;
  includeSubDomains: boolean;
}

export interface HelmetConfig {
  enabled: boolean;
  dnsPrefetchControl: boolean;
  frameguard: 'DENY' | 'SAMEORIGIN';
  referrerPolicy: string;
  hsts: HstsOptions | null;
  contentSecurityPolicy: string | null;
}

const defaultConfig: HelmetConfig = {
  enabled: true,
  dnsPrefetchControl: false,
  frameguard: 'SAMEORIGIN',
  referrerPolicy: 'no-referrer',
  hsts: { maxAge: 15552000, includeSubDomains: true },
  contentSecurityPolicy: null,
};

let currentConfig: HelmetConfig = { ...defaultConfig };

export function configureHelmet(options: Partial<HelmetConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getHelmetConfig(): HelmetConfig {
  return currentConfig;
}

export function isHelmetEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetHelmetConfig(): void {
  currentConfig = { ...defaultConfig };
}
