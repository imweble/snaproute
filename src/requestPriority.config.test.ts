import {
  configureRequestPriority,
  getRequestPriorityConfig,
  isRequestPriorityEnabled,
  resetRequestPriorityConfig,
} from './requestPriority.config';

beforeEach(() => {
  resetRequestPriorityConfig();
});

describe('requestPriority.config', () => {
  it('returns default config', () => {
    const config = getRequestPriorityConfig();
    expect(config.enabled).toBe(true);
    expect(config.header).toBe('X-Priority');
    expect(config.exposeHeader).toBe(false);
  });

  it('updates config with configureRequestPriority', () => {
    configureRequestPriority({ header: 'X-Custom-Priority', exposeHeader: true });
    const config = getRequestPriorityConfig();
    expect(config.header).toBe('X-Custom-Priority');
    expect(config.exposeHeader).toBe(true);
  });

  it('disables priority via config', () => {
    configureRequestPriority({ enabled: false });
    expect(isRequestPriorityEnabled()).toBe(false);
  });

  it('resets config to defaults', () => {
    configureRequestPriority({ enabled: false, header: 'X-Other' });
    resetRequestPriorityConfig();
    const config = getRequestPriorityConfig();
    expect(config.enabled).toBe(true);
    expect(config.header).toBe('X-Priority');
  });

  it('returns a copy of config to prevent mutation', () => {
    const config = getRequestPriorityConfig();
    config.header = 'mutated';
    expect(getRequestPriorityConfig().header).toBe('X-Priority');
  });
});
