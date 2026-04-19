import path from 'path';
import { Router } from './router';
import { loadFileRoutes } from './fileRouter';

function makeRouter(): Router & Record<string, jest.Mock> {
  const routes: Record<string, any> = {};
  const router = {} as any;
  for (const m of ['get', 'post', 'put', 'delete', 'patch']) {
    router[m] = jest.fn((p: string, handler: Function) => {
      routes[`${m}:${p}`] = handler;
    });
  }
  router._routes = routes;
  return router;
}

describe('loadFileRoutes', () => {
  it('throws if directory does not exist', async () => {
    const router = makeRouter();
    await expect(loadFileRoutes(router as any, './nonexistent')).rejects.toThrow(
      'Routes directory not found'
    );
  });

  it('registers routes from files in the routes directory', async () => {
    const router = makeRouter();
    const fixturesDir = path.join(__dirname, '__fixtures__/routes');
    await loadFileRoutes(router as any, fixturesDir);

    expect(router.get).toHaveBeenCalledWith('/users', expect.any(Function));
    expect(router.post).toHaveBeenCalledWith('/users', expect.any(Function));
  });

  it('maps [id] segments to :id params', async () => {
    const router = makeRouter();
    const fixturesDir = path.join(__dirname, '__fixtures__/routes');
    await loadFileRoutes(router as any, fixturesDir);

    expect(router.get).toHaveBeenCalledWith('/users/:id', expect.any(Function));
  });

  it('maps index files to parent path', async () => {
    const router = makeRouter();
    const fixturesDir = path.join(__dirname, '__fixtures__/routes');
    await loadFileRoutes(router as any, fixturesDir);

    const calls = (router.get as jest.Mock).mock.calls.map((c: any) => c[0]);
    expect(calls).toContain('/health');
  });
});
