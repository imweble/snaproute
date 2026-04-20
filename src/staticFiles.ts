import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { getStaticFilesConfig, isStaticFilesEnabled } from './staticFiles.config';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
};

export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export function serveFile(
  res: ServerResponse,
  filePath: string,
  maxAge: number
): void {
  const stat = fs.statSync(filePath);
  const mimeType = getMimeType(filePath);
  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Length': stat.size,
    'Cache-Control': `public, max-age=${maxAge}`,
  });
  fs.createReadStream(filePath).pipe(res);
}

export function staticFiles(
  urlPrefix: string = '/static'
) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (!isStaticFilesEnabled()) return next();

    const config = getStaticFilesConfig();
    const url = req.url || '/';

    if (!url.startsWith(urlPrefix)) return next();

    const relativePath = url.slice(urlPrefix.length).split('?')[0];
    const safePath = path.normalize(relativePath).replace(/^\/+/, '');
    const fullPath = path.join(config.root, safePath);

    if (!fullPath.startsWith(path.resolve(config.root))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return next();
    }

    serveFile(res, fullPath, config.maxAge);
  };
}
