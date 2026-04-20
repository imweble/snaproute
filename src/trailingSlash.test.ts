import { trailingSlash } from "./trailingSlash";
import { IncomingMessage, ServerResponse } from "http";

function mockReqRes(url: string): {
  req: Partial<IncomingMessage>;
  res: Partial<ServerResponse> & { _status?: number; _headers?: Record<string, string> };
  next: jest.Mock;
} {
  const res: Partial<ServerResponse> & { _status?: number; _headers?: Record<string, string> } = {
    _status: undefined,
    _headers: {},
    writeHead(status: number, headers?: Record<string, string>) {
      this._status = status;
      this._headers = { ...this._headers, ...headers };
    },
    end: jest.fn(),
  };
  return {
    req: { url },
    res,
    next: jest.fn(),
  };
}

describe("trailingSlash", () => {
  describe("mode: strip (default)", () => {
    it("redirects when trailing slash is present", () => {
      const { req, res, next } = mockReqRes("/users/");
      trailingSlash()(req as IncomingMessage, res as ServerResponse, next);
      expect(res._status).toBe(301);
      expect(res._headers?.Location).toBe("/users");
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next when no trailing slash", () => {
      const { req, res, next } = mockReqRes("/users");
      trailingSlash()(req as IncomingMessage, res as ServerResponse, next);
      expect(next).toHaveBeenCalled();
    });

    it("preserves query string when stripping", () => {
      const { req, res, next } = mockReqRes("/users/?page=2");
      trailingSlash()(req as IncomingMessage, res as ServerResponse, next);
      expect(res._headers?.Location).toBe("/users?page=2");
    });
  });

  describe("mode: add", () => {
    it("redirects when trailing slash is missing", () => {
      const { req, res, next } = mockReqRes("/users");
      trailingSlash({ mode: "add" })(req as IncomingMessage, res as ServerResponse, next);
      expect(res._status).toBe(301);
      expect(res._headers?.Location).toBe("/users/");
    });

    it("calls next when trailing slash already present", () => {
      const { req, res, next } = mockReqRes("/users/");
      trailingSlash({ mode: "add" })(req as IncomingMessage, res as ServerResponse, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("mode: redirect", () => {
    it("strips trailing slash with custom status code", () => {
      const { req, res, next } = mockReqRes("/about/");
      trailingSlash({ mode: "redirect", statusCode: 308 })(req as IncomingMessage, res as ServerResponse, next);
      expect(res._status).toBe(308);
      expect(res._headers?.Location).toBe("/about");
    });
  });

  describe("root path", () => {
    it("always calls next for root /", () => {
      const { req, res, next } = mockReqRes("/");
      trailingSlash()(req as IncomingMessage, res as ServerResponse, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
