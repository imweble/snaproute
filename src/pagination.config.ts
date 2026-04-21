export interface PaginationConfig {
  defaultLimit: number;
  maxLimit: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: PaginationConfig = {
  defaultLimit: 20,
  maxLimit: 100,
  enabled: true,
};

let currentConfig: PaginationConfig = { ...DEFAULT_CONFIG };

export function configurePagination(config: Partial<PaginationConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getPaginationConfig(): PaginationConfig {
  return { ...currentConfig };
}

export function isPaginationEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetPaginationConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}
