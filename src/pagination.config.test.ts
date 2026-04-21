import {
  configurePagination,
  getPaginationConfig,
  isPaginationEnabled,
  resetPaginationConfig,
} from './pagination.config';

beforeEach(() => resetPaginationConfig());

describe('pagination.config', () => {
  it('returns default config', () => {
    const config = getPaginationConfig();
    expect(config.defaultLimit).toBe(20);
    expect(config.maxLimit).toBe(100);
    expect(config.enabled).toBe(true);
  });

  it('merges partial config', () => {
    configurePagination({ defaultLimit: 10, maxLimit: 50 });
    const config = getPaginationConfig();
    expect(config.defaultLimit).toBe(10);
    expect(config.maxLimit).toBe(50);
    expect(config.enabled).toBe(true);
  });

  it('isPaginationEnabled returns true by default', () => {
    expect(isPaginationEnabled()).toBe(true);
  });

  it('isPaginationEnabled returns false when disabled', () => {
    configurePagination({ enabled: false });
    expect(isPaginationEnabled()).toBe(false);
  });

  it('resetPaginationConfig restores defaults', () => {
    configurePagination({ defaultLimit: 5, maxLimit: 10 });
    resetPaginationConfig();
    const config = getPaginationConfig();
    expect(config.defaultLimit).toBe(20);
    expect(config.maxLimit).toBe(100);
  });
});
