import { IncomingMessage } from 'http';

interface RequestDedupConfig {
  enabled: boolean;
  methods: string[];
  keyFn?: (req: IncomingMessage) => string;
}

const defaultConfig: RequestDedupConfig = {
  enabled: true,
  methods: ['POST', 'PUT', 'PATCH'],
};

let currentConfig: RequestDedupConfig = { ...defaultConfig };

export function configureRequestDedup(options: Partial<RequestDedupConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getRequestDedupConfig(): RequestDedupConfig {
  return { ...currentConfig };
}

export function isRequestDedupEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetRequestDedupConfig(): void {
  currentConfig = { ...defaultConfig };
}
