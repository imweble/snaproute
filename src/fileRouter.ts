import fs from 'fs';
import path from 'path';
import { Router } from './router';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

function toRoutePath(filePath: string, baseDir: string): string {
  const relative = path.relative(baseDir, filePath);
  const withoutExt = relative.replace(/\.(ts|js)$/, '');
  const routePath = withoutExt
    .replace(/\/index$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1');
  return '/' + routePath.replace(/\\/g, '/');
}

function scanDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDir(full));
    } else if (/\.(ts|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

export async function loadFileRoutes(router: Router, routesDir: string): Promise<void> {
  const absDir = path.resolve(routesDir);
  if (!fs.existsSync(absDir)) {
    throw new Error(`Routes directory not found: ${absDir}`);
  }

  const files = scanDir(absDir);

  for (const file of files) {
    const routePath = toRoutePath(file, absDir);
    const mod = await import(file);

    for (const method of HTTP_METHODS) {
      if (typeof mod[method] === 'function') {
        (router as any)[method](routePath, mod[method]);
      }
    }
  }
}
