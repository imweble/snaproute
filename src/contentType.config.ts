export interface ContentTypeConfig {
  allowed: string[];
  strict: boolean;
  enabled: boolean;
}

const DEFAULT_CONFIG: ContentTypeConfig = {
  allowed: ['application/json'],
  strict: false,
  enabled: true,
};

let config: ContentTypeConfig = { ...DEFAULT_CONFIG };

export function configureContentType(options: Partial<ContentTypeConfig>): void {
  config = { ...config, ...options };
}

export function getContentTypeConfig(): ContentTypeConfig {
  return { ...config };
}

export function isContentTypeEnabled(): boolean {
  return config.enabled;
}

export function resetContentTypeConfig(): void {
  config = { ...DEFAULT_CONFIG };
}
