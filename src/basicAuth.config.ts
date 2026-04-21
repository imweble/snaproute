import { BasicAuthVerifier } from './basicAuth';

export interface BasicAuthConfig {
  enabled: boolean;
  realm: string;
  verifier?: BasicAuthVerifier;
}

let config: BasicAuthConfig = {
  enabled: true,
  realm: 'Restricted',
};

export function configureBasicAuth(options: Partial<BasicAuthConfig>): void {
  config = { ...config, ...options };
}

export function getBasicAuthConfig(): BasicAuthConfig {
  return { ...config };
}

export function isBasicAuthEnabled(): boolean {
  return config.enabled;
}

export function resetBasicAuthConfig(): void {
  config = {
    enabled: true,
    realm: 'Restricted',
  };
}
