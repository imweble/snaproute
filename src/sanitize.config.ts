export interface SanitizeConfig {
  enabled: boolean;
}

let config: SanitizeConfig = {
  enabled: true,
};

export function configureSanitize(options: Partial<SanitizeConfig>): void {
  config = { ...config, ...options };
}

export function getSanitizeConfig(): SanitizeConfig {
  return { ...config };
}

export function isSanitizeEnabled(): boolean {
  return config.enabled;
}

export function resetSanitizeConfig(): void {
  config = { enabled: true };
}
