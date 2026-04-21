export interface CookieParserConfig {
  enabled: boolean;
  decode: boolean;
}

const defaultConfig: CookieParserConfig = {
  enabled: true,
  decode: true,
};

let currentConfig: CookieParserConfig = { ...defaultConfig };

export function configureCookieParser(options: Partial<CookieParserConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getCookieParserConfig(): CookieParserConfig {
  return { ...currentConfig };
}

export function isCookieParserEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetCookieParserConfig(): void {
  currentConfig = { ...defaultConfig };
}
