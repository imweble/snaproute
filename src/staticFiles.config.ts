import * as path from 'path';

export interface StaticFilesConfig {
  root: string;
  maxAge: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: StaticFilesConfig = {
  root: path.join(process.cwd(), 'public'),
  maxAge: 86400,
  enabled: true,
};

let currentConfig: StaticFilesConfig = { ...DEFAULT_CONFIG };

export function configureStaticFiles(options: Partial<StaticFilesConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getStaticFilesConfig(): StaticFilesConfig {
  return { ...currentConfig };
}

export function isStaticFilesEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetStaticFilesConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}
