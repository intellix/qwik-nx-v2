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

// EXPERIMENT: physically emit client build output into a `q/` subfolder so assets
// are served at /q/build/ and /q/assets/ while the app itself stays at the root (/).
const qOutput = {
  assetFileNames: 'q/assets/[hash]-[name].[ext]',
  entryFileNames: 'q/build/[hash].js',
  chunkFileNames: 'q/build/[hash].qwik.js',
};

export default defineConfig(({ isSsrBuild }) => {
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
    build: {
      // Only relocate the CLIENT build into q/. The SSR build (build.preview,
      // `vite build --ssr entry.preview.tsx`) must keep its stable entry name —
      // Qwik's preview middleware looks for server/entry.preview.js, so renaming
      // it to a hashed q/build/[hash].js would 400 the preview server.
      rollupOptions: isSsrBuild ? {} : { output: qOutput },
    },
    worker: {
      rollupOptions: { output: qOutput },
    },
  };
});
