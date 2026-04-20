import { IncomingMessage, ServerResponse } from 'http';
import { createHash } from 'crypto';

export type ETagMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

export interface ETagOptions {
  weak?: boolean;
}

export function generateETag(body: string, weak = false): string {
  const hash = createHash('sha1').update(body).digest('base64').substring(0, 27);
  return weak ? `W/"${hash}"` : `"${hash}"`;
}

export function etag(options: ETagOptions = {}): ETagMiddleware {
  const { weak = false } = options;

  return function etagMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const chunks: Buffer[] = [];

    res.write = function (chunk: any, ...args: any[]): boolean {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return originalWrite(chunk, ...args);
    };

    res.end = function (chunk?: any, ...args: any[]): ServerResponse {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));

      const body = Buffer.concat(chunks).toString();
      const statusCode = res.statusCode ?? 200;

      if (
        body &&
        statusCode >= 200 &&
        statusCode < 300 &&
        statusCode !== 204 &&
        !res.getHeader('etag')
      ) {
        const tag = generateETag(body, weak);
        res.setHeader('ETag', tag);

        const ifNoneMatch = (req as any).headers?.['if-none-match'];
        if (ifNoneMatch && ifNoneMatch === tag) {
          res.statusCode = 304;
          return originalEnd(null, ...args);
        }
      }

      return originalEnd(chunk, ...args);
    };

    next();
  };
}
