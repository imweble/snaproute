import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { staticFiles, getMimeType } from './staticFiles';
import { configureStaticFiles, resetStaticFilesConfig } from './staticFiles.config';

const FIXTURES_DIR = path.join(__dirname, '__fixtures__');

function mockReqRes(url: string): {
  req: Partial<IncomingMessage>;
  res: Partial<ServerResponse> & { headers: Record<string, unknown>; statusCode: number; body: string };
} {
  const res = {
    headers: {} as Record<string, unknown>,
    statusCode: 200,
    body: '',
    writeHead(code: number, headers?: Record<string, unknown>) {
      this.statusCode = code;
      if (headers) Object.assign(this.headers, headers);
    },
    end(data?: string) {
      this.body = data || '';
    },
  };
  return { req: { url, method: 'GET' }, res: res as any };
}

afterEach(() => {
  resetStaticFilesConfig();
});

describe('getMimeType', () => {
  it('returns correct MIME type for known extensions', () => {
    expect(getMimeType('file.html')).toBe('text/html');
    expect(getMimeType('style.css')).toBe('text/css');
    expect(getMimeType('app.js')).toBe('application/javascript');
    expect(getMimeType('data.json')).toBe('application/json');
    expect(getMimeType('image.png')).toBe('image/png');
  });

  it('returns octet-stream for unknown extension', () => {
    expect(getMimeType('file.xyz')).toBe('application/octet-stream');
  });
});

describe('staticFiles middleware', () => {
  it('calls next() when disabled', () => {
    configureStaticFiles({ enabled: false });
    const { req, res } = mockReqRes('/static/file.txt');
    const next = jest.fn();
    staticFiles('/static')(req as IncomingMessage, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when URL does not match prefix', () => {
    configureStaticFiles({ root: FIXTURES_DIR });
    const { req, res } = mockReqRes('/api/users');
    const next = jest.fn();
    staticFiles('/static')(req as IncomingMessage, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when file does not exist', () => {
    configureStaticFiles({ root: FIXTURES_DIR });
    const { req, res } = mockReqRes('/static/nonexistent.txt');
    const next = jest.fn();
    staticFiles('/static')(req as IncomingMessage, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('responds with 403 for path traversal attempts', () => {
    configureStaticFiles({ root: FIXTURES_DIR });
    const { req, res } = mockReqRes('/static/../../etc/passwd');
    const next = jest.fn();
    staticFiles('/static')(req as IncomingMessage, res as any, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
