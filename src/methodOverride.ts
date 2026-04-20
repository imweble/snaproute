import { IncomingMessage, ServerResponse } from 'http';
import { Middleware } from './middleware';

/**
 * Method Override Middleware
 *
 * Allows clients to override the HTTP method using a custom header or query parameter.
 * Useful for clients (e.g., HTML forms) that only support GET and POST.
 *
 * By default, checks the `X-HTTP-Method-Override` header and `_method` query parameter.
 */

export interface MethodOverrideOptions {
  /** Header name to check for method override (default: 'X-HTTP-Method-Override') */
  header?: string;
  /** Query parameter name to check for method override (default: '_method') */
  query?: string;
  /** Allowed override methods (default: ['PUT', 'PATCH', 'DELETE']) */
  allowedMethods?: string[];
}

const DEFAULT_OPTIONS: Required<MethodOverrideOptions> = {
  header: 'X-HTTP-Method-Override',
  query: '_method',
  allowedMethods: ['PUT', 'PATCH', 'DELETE'],
};

/**
 * Extracts the desired override method from the request.
 */
function getOverrideMethod(
  req: IncomingMessage,
  options: Required<MethodOverrideOptions>
): string | null {
  // Check header first
  const headerValue = req.headers[options.header.toLowerCase()];
  if (headerValue && typeof headerValue === 'string') {
    return headerValue.toUpperCase();
  }

  // Check query parameter
  const url = req.url ?? '';
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = url.slice(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const queryValue = params.get(options.query);
    if (queryValue) {
      return queryValue.toUpperCase();
    }
  }

  return null;
}

/**
 * Creates a method override middleware.
 *
 * @example
 * // Use with default options
 * router.use(methodOverride());
 *
 * // Use with custom header
 * router.use(methodOverride({ header: 'X-Method-Override' }));
 */
export function methodOverride(options: MethodOverrideOptions = {}): Middleware {
  const config: Required<MethodOverrideOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    allowedMethods: options.allowedMethods
      ? options.allowedMethods.map((m) => m.toUpperCase())
      : DEFAULT_OPTIONS.allowedMethods,
  };

  return (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ): void => {
    // Only override POST requests (forms can only send GET/POST)
    if (req.method?.toUpperCase() !== 'POST') {
      return next();
    }

    const overrideMethod = getOverrideMethod(req, config);

    if (overrideMethod && config.allowedMethods.includes(overrideMethod)) {
      // Store original method for reference
      (req as IncomingMessage & { originalMethod?: string }).originalMethod =
        req.method;
      req.method = overrideMethod;
    }

    next();
  };
}
