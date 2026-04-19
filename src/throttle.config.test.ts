import { configureThrottle, getThrottleConfig, isThrottlingEnabled, resetThrottleConfig } from './throttle.config';

beforeEach(() => resetThrottleConfig());

describe('throttle.config', () => {
  it('returns default config', () => {
    const config = getThrottleConfig();
    expect(config.requestsPerSecond).toBe(10);
    expect(config.maxQueue).toBe(5);
    expect(config.enabled).toBe(true);
  });

  it('configures partial options', () => {
    configureThrottle({ requestsPerSecond: 20 });
    expect(getThrottleConfig().requestsPerSecond).toBe(20);
    expect(getThrottleConfig().maxQueue).toBe(5);
  });

  it('isThrottlingEnabled reflects enabled flag', () => {
    expect(isThrottlingEnabled()).toBe(true);
    configureThrottle({ enabled: false });
    expect(isThrottlingEnabled()).toBe(false);
  });

  it('resets to defaults', () => {
    configureThrottle({ requestsPerSecond: 50, enabled: false });
    resetThrottleConfig();
    expect(getThrottleConfig().requestsPerSecond).toBe(10);
    expect(isThrottlingEnabled()).toBe(true);
  });
});
