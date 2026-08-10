import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { qwikCity } from '@qwik.dev/router/vite';
import { qwikVite } from '@qwik.dev/core/optimizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Absolute paths anchored to this config file's own location. `@nx/vite:preview-server`
// re-runs the client build internally, and relative paths here resolved one directory
// level too deep on that second invocation, writing a stray, duplicate build tree at
// apps/web/dist/apps/web/... alongside the correct top-level dist/apps/web/. Absolute
// paths are invocation-cwd-independent, so both build passes land in the same place.
const APP_DIR = dirname(fileURLToPath(import.meta.url)); // <repo>/apps/web
const REPO_ROOT = resolve(APP_DIR, '../..'); // <repo>

export default defineConfig(() => {
  return {
    cacheDir: resolve(REPO_ROOT, 'node_modules/.vite/apps/web'),
    root: APP_DIR,
    plugins: [
      qwikCity({
        routesDir: './src/routes',
      }),
      qwikVite({
        client: {
          outDir: resolve(REPO_ROOT, 'dist/apps/web/client'),
        },
        ssr: {
          outDir: resolve(REPO_ROOT, 'dist/apps/web/server'),
        },
        tsconfigFileNames: ['tsconfig.app.json'],
      }),
      tsconfigPaths({ root: '../../' }),
    ],
  };
});
