import { qwikCity } from '@qwik.dev/router/vite';
import { qwikVite } from '@qwik.dev/core/optimizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  return {
    // The fix: serve client assets (and mount the preview static server) under /q/,
    // matching the /q/build/ chunk URLs the SSR'd HTML requests. Without this,
    // `vite preview` serves chunks at /build/ and the SSR references /q/build/ -> 404.
    base: '/q/',
    cacheDir: '../../node_modules/.vite/apps/web',
    root: 'apps/web',
    plugins: [
      qwikCity({
        routesDir: './src/routes',
      }),
      qwikVite({
        client: {
          outDir: '../../dist/apps/web/client',
        },
        ssr: {
          outDir: '../../dist/apps/web/server',
        },
        tsconfigFileNames: ['tsconfig.app.json'],
      }),
      tsconfigPaths({ root: '../../' }),
    ],
    preview: {
      outDir: '../../dist/apps/web/client',
    },
  };
});
