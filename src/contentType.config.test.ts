import {
  configureContentType,
  getContentTypeConfig,
  isContentTypeEnabled,
  resetContentTypeConfig,
} from './contentType.config';

describe('contentType.config', () => {
  afterEach(() => {
    resetContentTypeConfig();
  });

  it('returns default config', () => {
    const cfg = getContentTypeConfig();
    expect(cfg.allowed).toEqual(['application/json']);
    expect(cfg.strict).toBe(false);
    expect(cfg.enabled).toBe(true);
  });

  it('configures allowed types', () => {
    configureContentType({ allowed: ['application/json', 'multipart/form-data'] });
    expect(getContentTypeConfig().allowed).toContain('multipart/form-data');
  });

  it('configures strict mode', () => {
    configureContentType({ strict: true });
    expect(getContentTypeConfig().strict).toBe(true);
  });

  it('disables middleware', () => {
    configureContentType({ enabled: false });
    expect(isContentTypeEnabled()).toBe(false);
  });

  it('resets to defaults', () => {
    configureContentType({ enabled: false, strict: true });
    resetContentTypeConfig();
    expect(isContentTypeEnabled()).toBe(true);
    expect(getContentTypeConfig().strict).toBe(false);
  });
});
