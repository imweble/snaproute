export interface MethodOverrideConfig {
  enabled: boolean;
  allowedMethods: string[];
  sources: Array<'header' | 'body' | 'query'>;
  headerName: string;
  bodyField: string;
  queryField: string;
}

const defaultConfig: MethodOverrideConfig = {
  enabled: true,
  allowedMethods: ['DELETE', 'PUT', 'PATCH'],
  sources: ['header', 'body', 'query'],
  headerName: 'x-http-method-override',
  bodyField: '_method',
  queryField: '_method',
};

let currentConfig: MethodOverrideConfig = { ...defaultConfig };

export function configureMethodOverride(config: Partial<MethodOverrideConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getMethodOverrideConfig(): MethodOverrideConfig {
  return { ...currentConfig };
}

export function isMethodOverrideEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetMethodOverrideConfig(): void {
  currentConfig = { ...defaultConfig };
}
