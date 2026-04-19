import { CompressOptions } from './compress';

let config: Required<CompressOptions> = {
  threshold: 1024,
  encodings: ['gzip', 'deflate'],
};

let enabled = true;

export function configureCompression(options: CompressOptions & { enabled?: boolean }): void {
  const { enabled: en, ...rest } = options;
  if (typeof en === 'boolean') enabled = en;
  config = {
    threshold: rest.threshold ?? config.threshold,
    encodings: rest.encodings ?? config.encodings,
  };
}

export function getCompressionConfig(): Required<CompressOptions> {
  return { ...config };
}

export function isCompressionEnabled(): boolean {
  return enabled;
}

export function resetCompressionConfig(): void {
  config = { threshold: 1024, encodings: ['gzip', 'deflate'] };
  enabled = true;
}
