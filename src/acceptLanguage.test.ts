import { IncomingMessage, ServerResponse } from 'http';
import {
  parseAcceptLanguage,
  getBestLanguage,
  acceptLanguage,
} from './acceptLanguage';

function mockReqRes(headers: Record<string, string> = {}) {
  const req = Object.assign(Object.create(IncomingMessage.prototype), {
    headers,
  }) as IncomingMessage & { [key: string]: any };
  const res = Object.create(ServerResponse.prototype) as ServerResponse;
  return { req, res };
}

describe('parseAcceptLanguage', () => {
  it('parses a simple header', () => {
    const result = parseAcceptLanguage('en-US,en;q=0.9,fr;q=0.8');
    expect(result[0]).toEqual({ lang: 'en-US', quality: 1.0 });
    expect(result[1]).toEqual({ lang: 'en', quality: 0.9 });
    expect(result[2]).toEqual({ lang: 'fr', quality: 0.8 });
  });

  it('handles a single language without quality', () => {
    const result = parseAcceptLanguage('de');
    expect(result).toEqual([{ lang: 'de', quality: 1.0 }]);
  });

  it('sorts by quality descending', () => {
    const result = parseAcceptLanguage('fr;q=0.5,en;q=0.9');
    expect(result[0].lang).toBe('en');
    expect(result[1].lang).toBe('fr');
  });
});

describe('getBestLanguage', () => {
  it('returns exact match', () => {
    const parsed = parseAcceptLanguage('en-US,fr;q=0.8');
    expect(getBestLanguage(parsed, ['fr', 'en-US'])).toBe('en-US');
  });

  it('returns base language match', () => {
    const parsed = parseAcceptLanguage('en-GB');
    expect(getBestLanguage(parsed, ['en-US'])).toBe('en-US');
  });

  it('returns null when no match', () => {
    const parsed = parseAcceptLanguage('ja');
    expect(getBestLanguage(parsed, ['en', 'fr'])).toBeNull();
  });
});

describe('acceptLanguage middleware', () => {
  it('sets req.language to best match', () => {
    const { req, res } = mockReqRes({ 'accept-language': 'fr;q=0.9,en;q=0.8' });
    const next = jest.fn();
    acceptLanguage(['en', 'fr'])(req, res, next);
    expect(req.language).toBe('fr');
    expect(next).toHaveBeenCalled();
  });

  it('falls back to defaultLanguage when no match', () => {
    const { req, res } = mockReqRes({ 'accept-language': 'ja' });
    const next = jest.fn();
    acceptLanguage(['en', 'fr'], 'en')(req, res, next);
    expect(req.language).toBe('en');
  });

  it('uses default when no accept-language header', () => {
    const { req, res } = mockReqRes();
    const next = jest.fn();
    acceptLanguage(['en', 'fr'], 'en')(req, res, next);
    expect(req.language).toBe('en');
  });
});
