import { IncomingMessage, ServerResponse } from 'http';
import { getHealthCheckConfig, isHealthCheckEnabled } from './healthCheck.config';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  timestamp: string;
  checks?: Record<string, { status: 'ok' | 'error'; message?: string }>;
}

const startTime = Date.now();

export async function runChecks(
  checks: Record<string, () => Promise<boolean>>
): Promise<Record<string, { status: 'ok' | 'error'; message?: string }>> {
  const results: Record<string, { status: 'ok' | 'error'; message?: string }> = {};
  for (const [name, fn] of Object.entries(checks)) {
    try {
      const ok = await fn();
      results[name] = { status: ok ? 'ok' : 'error' };
    } catch (err) {
      results[name] = { status: 'error', message: (err as Error).message };
    }
  }
  return results;
}

export function healthCheck(
  checks: Record<string, () => Promise<boolean>> = {}
) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!isHealthCheckEnabled()) return next();

    const config = getHealthCheckConfig();
    const url = req.url?.split('?')[0];

    if (url !== config.path) return next();

    const checkResults = await runChecks(checks);
    const hasError = Object.values(checkResults).some((c) => c.status === 'error');

    const body: HealthStatus = {
      status: hasError ? 'degraded' : 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      ...(Object.keys(checkResults).length > 0 && { checks: checkResults }),
    };

    const statusCode = hasError ? 503 : 200;
    const json = JSON.stringify(body);

    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(json);
  };
}
