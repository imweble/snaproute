import { Router } from './router';

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  test('registers and matches a simple GET route', () => {
    router.register('GET', '/users', jest.fn());
    const result = router.match('GET', '/users');
    expect(result).not.toBeNull();
    expect(result?.params).toEqual({});
  });

  test('matches route with dynamic param', () => {
    router.register('GET', '/users/:id', jest.fn());
    const result = router.match('GET', '/users/42');
    expect(result).not.toBeNull();
    expect(result?.params).toEqual({ id: '42' });
  });

  test('matches route with multiple params', () => {
    router.register('GET', '/users/:userId/posts/:postId', jest.fn());
    const result = router.match('GET', '/users/1/posts/99');
    expect(result?.params).toEqual({ userId: '1', postId: '99' });
  });

  test('returns null for unmatched route', () => {
    router.register('GET', '/users', jest.fn());
    const result = router.match('GET', '/posts');
    expect(result).toBeNull();
  });

  test('does not match wrong method', () => {
    router.register('GET', '/users', jest.fn());
    const result = router.match('POST', '/users');
    expect(result).toBeNull();
  });

  test('registers multiple methods on same path', () => {
    router.register('GET', '/items', jest.fn());
    router.register('POST', '/items', jest.fn());
    expect(router.match('GET', '/items')).not.toBeNull();
    expect(router.match('POST', '/items')).not.toBeNull();
  });

  test('returns the correct handler for a matched route', () => {
    const handler = jest.fn();
    router.register('GET', '/users', handler);
    const result = router.match('GET', '/users');
    expect(result?.handler).toBe(handler);
  });

  test('returns the correct handler for a dynamic route', () => {
    const handler = jest.fn();
    router.register('GET', '/users/:id', handler);
    const result = router.match('GET', '/users/42');
    expect(result?.handler).toBe(handler);
  });
});
