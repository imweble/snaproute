# snaproute

Lightweight Express-like router with file-based routing for Node.js APIs.

## Installation

```bash
npm install snaproute
```

## Usage

### File-based Routing

Create route files under a `routes/` directory:

```ts
// routes/users/[id].ts
import { RouteHandler } from 'snaproute';

export const GET: RouteHandler = (req, res) => {
  const { id } = req.params;
  res.json({ userId: id });
};

export const POST: RouteHandler = (req, res) => {
  res.status(201).json({ message: 'User created' });
};
```

### Bootstrap Your Server

```ts
import { createRouter } from 'snaproute';
import http from 'http';

const router = await createRouter({
  routesDir: './routes',
});

const server = http.createServer((req, res) => {
  router.handle(req, res);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Manual Route Registration

```ts
import { createRouter } from 'snaproute';

const router = createRouter();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

## Features

- 📁 File-based routing with dynamic segments (`[id]`)
- ⚡ Minimal overhead, zero unnecessary dependencies
- 🔌 Drop-in middleware support
- 🟦 Full TypeScript support

## License

[MIT](./LICENSE)