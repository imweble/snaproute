import {
  configureRequestSize,
  getRequestSizeConfig,
  isRequestSizeEnabled,
  resetRequestSizeConfig,
} from './requestSize.config';

describe('requestSize.config', () => {
  afterEach(() => {
    resetRequestSizeConfig();
  });

  it('returns default config', () => {
    const config = getRequestSizeConfig();
    expect(config.maxSize).toBe('1mb');
    expect(config.enabled).toBe(true);
  });

  it('updates config with configureRequestSize', () => {
    configureRequestSize({ maxSize: '5mb' });
    const config = getRequestSizeConfig();
    expect(config.maxSize).toBe('5mb');
  });

  it('disables request size checking', () => {
    configureRequestSize({ enabled: false });
    expect(isRequestSizeEnabled()).toBe(false);
  });

  it('resets config to defaults', () => {
    configureRequestSize({ maxSize: '10mb', enabled: false });
    resetRequestSizeConfig();
    const config = getRequestSizeConfig();
    expect(config.maxSize).toBe('1mb');
    expect(config.enabled).toBe(true);
  });

  it('returns a copy of config to prevent mutation', () => {
    const config1 = getRequestSizeConfig();
    config1.maxSize = '999mb';
    const config2 = getRequestSizeConfig();
    expect(config2.maxSize).toBe('1mb');
  });
});
