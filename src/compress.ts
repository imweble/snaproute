import { IncomingMessage, ServerResponse } from 'http';
import { gzip, deflate } from 'zlib';
import { promisify } from 'util';
import { Middleware } from './router';

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

export interface CompressOptions {
  threshold?: number; // bytes
  encodings?: ('gzip' | 'deflate')[];
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  threshold: 1024,
  encodings: ['gzip', 'deflate'],
};

function getAcceptedEncoding(
  req: IncomingMessage,
  supported: ('gzip' | 'deflate')[]
): 'gzip' | 'deflate' | null {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  for (const enc of supported) {
    if (acceptEncoding.includes(enc)) return enc;
  }
  return null;
}

export function compress(options: CompressOptions = {}): Middleware {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (req, res, next) => {
    const encoding = getAcceptedEncoding(req, opts.encodings);
    if (!encoding) return next();

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const chunks: Buffer[] = [];

    res.write = (chunk: any) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };

    res.end = (chunk?: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const body = Buffer.concat(chunks);

      if (body.length < opts.threshold) {
        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd(body);
        return res;
      }

      const compressFn = encoding === 'gzip' ? gzipAsync : deflateAsync;
      compressFn(body).then((compressed) => {
        res.setHeader('Content-Encoding', encoding);
        res.setHeader('Content-Length', compressed.length);
        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd(compressed);
      }).catch(() => {
        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd(body);
      });

      return res;
    };

    next();
  };
}
