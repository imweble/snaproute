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

/**
 * Checks whether a given IP address is permitted based on the current
 * allow/deny lists. If the allow list is non-empty, the IP must be present
 * in it. If the deny list is non-empty, the IP must not be present in it.
 * Returns true if the IP is allowed, false otherwise.
 */
export function isIpAllowed(ip: string): boolean {
  if (!config.enabled) {
    return true;
  }

  if (config.denyList.includes(ip)) {
    return false;
  }

  if (config.allowList.length > 0 && !config.allowList.includes(ip)) {
    return false;
  }

  return true;
}
