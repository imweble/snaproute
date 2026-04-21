import { IncomingMessage, ServerResponse } from 'http';
import { getSessionConfig } from './session.config';

type SessionData = Record<string, unknown>;

const sessionStore = new Map<string, { data: SessionData; expires: number }>();

export function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function clearSessionStore(): void {
  sessionStore.clear();
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookieHeader = req.headers['cookie'] || '';
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    }).filter(([k]) => k)
  );
}

export function session() {
  return (req: IncomingMessage & { session?: SessionData }, res: ServerResponse, next: () => void) => {
    const config = getSessionConfig();
    if (!config.enabled) return next();

    const cookies = parseCookies(req);
    let sessionId = cookies[config.cookieName];
    const now = Date.now();

    if (sessionId && sessionStore.has(sessionId)) {
      const entry = sessionStore.get(sessionId)!;
      if (entry.expires > now) {
        req.session = entry.data;
        entry.expires = now + config.maxAge * 1000;
      } else {
        sessionStore.delete(sessionId);
        sessionId = '';
      }
    }

    if (!sessionId || !sessionStore.has(sessionId)) {
      sessionId = generateSessionId();
      const data: SessionData = {};
      sessionStore.set(sessionId, { data, expires: now + config.maxAge * 1000 });
      req.session = data;
    }

    const cookieValue = `${config.cookieName}=${sessionId}; HttpOnly; Path=/; Max-Age=${config.maxAge}${
      config.secure ? '; Secure' : ''
    }${
      config.sameSite ? `; SameSite=${config.sameSite}` : ''
    }`;
    res.setHeader('Set-Cookie', cookieValue);
    next();
  };
}
