import {
  configureCompression,
  getCompressionConfig,
  isCompressionEnabled,
  resetCompressionConfig,
} from './compress.config';

describe('compress.config', () => {
  afterEach(() => {
    resetCompressionConfig();
  });

  it('returns default config', () => {
    const config = getCompressionConfig();
    expect(config.threshold).toBe(1024);
    expect(config.encodings).toEqual(['gzip', 'deflate']);
  });

  it('is enabled by default', () => {
    expect(isCompressionEnabled()).toBe(true);
  });

  it('configures threshold', () => {
    configureCompression({ threshold: 512 });
    expect(getCompressionConfig().threshold).toBe(512);
  });

  it('configures encodings', () => {
    configureCompression({ encodings: ['gzip'] });
    expect(getCompressionConfig().encodings).toEqual(['gzip']);
  });

  it('can be disabled', () => {
    configureCompression({ enabled: false });
    expect(isCompressionEnabled()).toBe(false);
  });

  it('resets to defaults', () => {
    configureCompression({ threshold: 0, enabled: false });
    resetCompressionConfig();
    expect(getCompressionConfig().threshold).toBe(1024);
    expect(isCompressionEnabled()).toBe(true);
  });
});
