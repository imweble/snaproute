import {
  configureBasicAuth,
  getBasicAuthConfig,
  isBasicAuthEnabled,
  resetBasicAuthConfig,
} from './basicAuth.config';

describe('basicAuth.config', () => {
  afterEach(() => resetBasicAuthConfig());

  it('returns default config', () => {
    const cfg = getBasicAuthConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.realm).toBe('Restricted');
    expect(cfg.verifier).toBeUndefined();
  });

  it('configures realm', () => {
    configureBasicAuth({ realm: 'Admin Area' });
    expect(getBasicAuthConfig().realm).toBe('Admin Area');
  });

  it('configures verifier', () => {
    const verifier = (u: string, p: string) => u === 'admin' && p === 'secret';
    configureBasicAuth({ verifier });
    expect(getBasicAuthConfig().verifier).toBe(verifier);
  });

  it('disables basic auth', () => {
    configureBasicAuth({ enabled: false });
    expect(isBasicAuthEnabled()).toBe(false);
  });

  it('resets config to defaults', () => {
    configureBasicAuth({ enabled: false, realm: 'Custom' });
    resetBasicAuthConfig();
    const cfg = getBasicAuthConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.realm).toBe('Restricted');
  });
});
