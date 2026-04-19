import http from 'http';
import https from 'https';
import { IncomingMessage, ServerResponse } from 'http';
import { getProxyConfig, isProxyEnabled } from './proxy.config';

export type ProxyOptions = {
  target: string;
  pathRewrite?: (path: string) => string;
  headers?: Record<string, string>;
};

export function proxy(options: ProxyOptions) {
  return (req: IncomingMessage, res: ServerResponse, next: Function) => {
    if (!isProxyEnabled()) return next();

    const config = getProxyConfig();
    const target = new URL(options.target);
    const isHttps = target.protocol === 'https:';
    const transport = isHttps ? https : http;

    let path = req.url || '/';
    if (options.pathRewrite) path = options.pathRewrite(path);

    const reqHeaders = { ...req.headers, ...options.headers, host: target.host };

    const proxyReq = transport.request(
      {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path,
        method: req.method,
        headers: reqHeaders,
        timeout: config.timeout,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      next(err);
    });

    req.pipe(proxyReq);
  };
}
