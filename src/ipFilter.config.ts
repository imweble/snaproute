export interface IpFilterConfig {
  enabled: boolean;
  allowList: string[];
  denyList: string[];
}

let config: IpFilterConfig = {
  enabled: true,
  allowList: [],
  denyList: [],
};

export function configureIpFilter(options: Partial<IpFilterConfig>): void {
  config = { ...config, ...options };
}

export function getIpFilterConfig(): IpFilterConfig {
  return { ...config };
}

export function isIpFilterEnabled(): boolean {
  return config.enabled;
}

export function resetIpFilterConfig(): void {
  config = { enabled: true, allowList: [], denyList: [] };
}
