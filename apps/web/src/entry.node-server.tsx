/*
 * WHAT IS THIS FILE?
 *
 * A standalone Node HTTP server for the production build. It is bundled to
 * `dist/apps/web/server/entry.node-server.js` and run with plain `node` (see the
 * `start` script in package.json) — no Vite, no Nx at runtime. It serves the SSR
 * app and the static client assets straight out of the `dist` folder.
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createQwikRouter, type QwikRouterNodeRequestOptions } from '@qwik.dev/router/middleware/node';
import qwikRouterConfig from '@qwik-router-config';
import render from './entry.ssr';

// Our client assets are emitted under `q/` (see the rollup output overrides in
// vite.config.mts). Qwik's static-file detector (`isStaticPath`) otherwise only
// treats `/build/*` and `/assets/*` as static and would 404 our `/q/build/*` and
// `/q/assets/*` requests. These globals point it at the real folders.
(globalThis as { __QWIK_BUILD_DIR__?: string }).__QWIK_BUILD_DIR__ = 'q/build';
(globalThis as { __QWIK_ASSETS_DIR__?: string }).__QWIK_ASSETS_DIR__ = 'q/assets';

// This file lives at dist/apps/web/server/entry.node-server.js; the client build
// sits next to it at dist/apps/web/client.
const clientDir = join(fileURLToPath(import.meta.url), '..', '..', 'client');

// qwikRouterConfig is required by the middleware at runtime but is missing from
// QwikRouterNodeRequestOptions in @qwik.dev/router@2.0.0-beta.38 — assert to satisfy it.
const { router, staticFile, notFound } = createQwikRouter({
  render,
  qwikRouterConfig,
  static: {
    root: clientDir,
    cacheControl: 'public, max-age=31536000',
  },
} as QwikRouterNodeRequestOptions);

const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  staticFile(req, res, () => {
    router(req, res, () => {
      notFound(req, res, () => undefined);
    });
  });
}).listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started: http://localhost:${port}/`);
});
