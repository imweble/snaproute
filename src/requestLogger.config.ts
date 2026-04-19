import { LogHandler, setLogHandler, resetLogHandler } from './requestLogger';

export interface RequestLoggerConfig {
  enabled: boolean;
  handler?: LogHandler;
}

let config: RequestLoggerConfig = {
  enabled: true,
};

export function configureRequestLogger(options: Partial<RequestLoggerConfig>): void {
  config = { ...config, ...options };
  if (options.handler) {
    setLogHandler(options.handler);
  }
}

export function getRequestLoggerConfig(): RequestLoggerConfig {
  return { ...config };
}

export function isRequestLoggingEnabled(): boolean {
  return config.enabled;
}

export function resetRequestLoggerConfig(): void {
  config = { enabled: true };
  resetLogHandler();
}
