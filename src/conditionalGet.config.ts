export interface ConditionalGetConfig {
  enabled: boolean;
  /** Methods to apply conditional GET logic to (default: GET, HEAD) */
  methods: string[];
}

const defaultConfig: ConditionalGetConfig = {
  enabled: true,
  methods: ['GET', 'HEAD'],
};

let currentConfig: ConditionalGetConfig = { ...defaultConfig };

export function configureConditionalGet(config: Partial<ConditionalGetConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
    methods: config.methods
      ? config.methods.map(m => m.toUpperCase())
      : currentConfig.methods,
  };
}

export function getConditionalGetConfig(): ConditionalGetConfig {
  return { ...currentConfig };
}

export function isConditionalGetEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetConditionalGetConfig(): void {
  currentConfig = { ...defaultConfig };
}
