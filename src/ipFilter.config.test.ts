import { configureIpFilter, getIpFilterConfig, isIpFilterEnabled, resetIpFilterConfig } from './ipFilter.config';

beforeEach(() => resetIpFilterConfig());

describe('ipFilter.config', () => {
  it('returns default config', () => {
    const cfg = getIpFilterConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.allowList).toEqual([]);
    expect(cfg.denyList).toEqual([]);
  });

  it('configures allowList and denyList', () => {
    configureIpFilter({ allowList: ['192.168.1.1'], denyList: ['10.0.0.1'] });
    const cfg = getIpFilterConfig();
    expect(cfg.allowList).toEqual(['192.168.1.1']);
    expect(cfg.denyList).toEqual(['10.0.0.1']);
  });

  it('can disable ip filtering', () => {
    configureIpFilter({ enabled: false });
    expect(isIpFilterEnabled()).toBe(false);
  });

  it('resets to defaults', () => {
    configureIpFilter({ enabled: false, allowList: ['1.2.3.4'] });
    resetIpFilterConfig();
    expect(isIpFilterEnabled()).toBe(true);
    expect(getIpFilterConfig().allowList).toEqual([]);
  });
});
