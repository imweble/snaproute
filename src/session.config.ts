export interface SessionConfig {
  enabled: boolean;
  cookieName: string;
  maxAge: number;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | null;
}

const defaultConfig: SessionConfig = {
  enabled: true,
  cookieName: 'snaproute.sid',
  maxAge: 3600,
  secure: false,
  sameSite: 'Lax',
};

let currentConfig: SessionConfig = { ...defaultConfig };

export function configureSession(options: Partial<SessionConfig>): void {
  currentConfig = { ...currentConfig, ...options };
}

export function getSessionConfig(): SessionConfig {
  return { ...currentConfig };
}

export function isSessionEnabled(): boolean {
  return currentConfig.enabled;
}

export function resetSessionConfig(): void {
  currentConfig = { ...defaultConfig };
}
