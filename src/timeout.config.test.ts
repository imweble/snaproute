import {
  configureTimeout,
  getTimeoutConfig,
  isTimeoutEnabled,
  resetTimeoutConfig,
} from './timeout.config';

afterEach(() => resetTimeoutConfig());

describe('timeout.config', () => {
  it('returns default config', () => {
    const cfg = getTimeoutConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.ms).toBe(5000);
    expect(cfg.message).toBe('Request timed out');
  });

  it('configures partial overrides', () => {
    configureTimeout({ ms: 3000 });
    expect(getTimeoutConfig().ms).toBe(3000);
    expect(getTimeoutConfig().enabled).toBe(true);
  });

  it('disables timeout', () => {
    configureTimeout({ enabled: false });
    expect(isTimeoutEnabled()).toBe(false);
  });

  it('resets to defaults', () => {
    configureTimeout({ ms: 1000, enabled: false });
    resetTimeoutConfig();
    expect(getTimeoutConfig().ms).toBe(5000);
    expect(isTimeoutEnabled()).toBe(true);
  });
});
