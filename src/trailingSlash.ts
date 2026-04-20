import { IncomingMessage, ServerResponse } from "http";
import { Middleware } from "./router";

export type TrailingSlashMode = "redirect" | "strip" | "add";

export interface TrailingSlashOptions {
  mode?: TrailingSlashMode;
  statusCode?: 301 | 302 | 307 | 308;
}

function getUrl(req: IncomingMessage): string {
  return req.url || "/";
}

function hasTrailingSlash(path: string): boolean {
  const pathname = path.split("?")[0];
  return pathname.length > 1 && pathname.endsWith("/");
}

function addTrailingSlash(path: string): string {
  const [pathname, query] = path.split("?");
  const newPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return query ? `${newPath}?${query}` : newPath;
}

function stripTrailingSlash(path: string): string {
  const [pathname, query] = path.split("?");
  const newPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return query ? `${newPath}?${query}` : newPath;
}

export function trailingSlash(options: TrailingSlashOptions = {}): Middleware {
  const { mode = "strip", statusCode = 301 } = options;

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = getUrl(req);
    const pathname = url.split("?")[0];

    if (pathname === "/") {
      return next();
    }

    if (mode === "strip" && hasTrailingSlash(url)) {
      const newUrl = stripTrailingSlash(url);
      res.writeHead(statusCode, { Location: newUrl });
      res.end();
      return;
    }

    if (mode === "add" && !hasTrailingSlash(url)) {
      const newUrl = addTrailingSlash(url);
      res.writeHead(statusCode, { Location: newUrl });
      res.end();
      return;
    }

    if (mode === "redirect") {
      if (hasTrailingSlash(url)) {
        const newUrl = stripTrailingSlash(url);
        res.writeHead(statusCode, { Location: newUrl });
        res.end();
        return;
      }
    }

    next();
  };
}
