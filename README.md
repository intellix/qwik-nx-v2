# qwik-nx-v2

Minimal Nx workspace running **Qwik v2** where `serve`, `build`, and **`preview`**
all work locally — a reference for fixing broken `preview` in Nx + Qwik v2 monorepos.

The app is served at the **root (`/`)** while its client assets are served under
**`/q/`** (`/q/build/*.js`, `/q/assets/*`) — mirroring a deployment where a load
balancer forwards `/q/*` to the Qwik app but the app's own routes live at `/`.

## The problem

Qwik apps behind a load balancer often expose client assets under a path prefix
like `/q/`. The SSR entry makes the browser request chunks from `/q/build/*.js`,
but by default Qwik's client build emits them to `dist/<app>/client/build/`, which
a plain `vite preview` serves at `/build/*`. In production a load balancer rewrites
`/q/` → the app root, so it works. Locally there is no load balancer, so
`vite preview` (and `@nx/vite:preview-server`) return **404** for every `/q/build/*`
chunk and the app never hydrates.

## The fix

Physically emit the **client** build into a `q/` folder so the on-disk path matches
the URL path — no load-balancer rewrite needed, and the app itself stays at `/`.
In `apps/web/vite.config.mts`:

```ts
const qOutput = {
  assetFileNames: 'q/assets/[hash]-[name].[ext]',
  entryFileNames: 'q/build/[hash].js',
  chunkFileNames: 'q/build/[hash].qwik.js',
};

export default defineConfig(({ isSsrBuild }) => ({
  // ...
  build: {
    // Client only — see the SSR caveat below.
    rollupOptions: isSsrBuild ? {} : { output: qOutput },
  },
  worker: { rollupOptions: { output: qOutput } },
}));
```

Files now land at `dist/apps/web/client/q/build/*.qwik.js` and
`.../q/assets/*`. Qwik names manifest bundles relative to its `build/` assetsDir,
so with `q:base="/build/"` the browser resolves `/build/../q/build/x.js` →
`/q/build/x.js`. Serving from root, that's exactly where the file is → **200**.

Three caveats this example bakes in, each of which can independently break preview:

1. **Gate the rename to the client build (`isSsrBuild ? {} : …`).** The same config
   drives the SSR build (`build.preview`, `vite build --ssr entry.preview.tsx`).
   Applying `entryFileNames: 'q/build/[hash].js'` there renames `entry.preview.js`
   to a hashed name, and Qwik's preview middleware — which looks for
   `server/entry.preview.js` — returns **400** ("Unable to find output … entry.preview").

2. **`preview` needs the SSR bundle.** `web:preview` `dependsOn` a `build.preview`
   target (`vite build --ssr apps/web/src/entry.preview.tsx`) that produces
   `dist/apps/web/server/entry.preview.js`. `build.client` alone doesn't, and the
   preview middleware has nothing to render without it.

3. **Absolute paths + no `staticFilePath`.** `apps/web/vite.config.mts` uses
   absolute `root`/`outDir` paths (via `fileURLToPath`), and the `preview` target
   omits `staticFilePath`. `@nx/vite:preview-server` re-runs the client build
   internally and, with relative paths or a `staticFilePath`, resolves the output
   one level too deep — writing a stray, duplicate `apps/web/dist/apps/web/...` tree.

> **Simpler alternative:** if you're fine with the **whole app** living under `/q/`
> (routes included, e.g. `http://localhost:4173/q/`), just set `base: '/q/'` in the
> vite config and drop the `qOutput` rollup overrides. This example uses the rollup
> approach instead because it keeps routes at `/` and only moves the assets.

## Run it

```bash
pnpm install
pnpm nx run web:serve      # dev SSR at http://localhost:5173/
pnpm nx run web:preview    # builds SSR + client, serves at http://localhost:4173/
```

`web:preview` auto-runs `build.preview` (which depends on `build.client`) via Nx's
`dependsOn`, so there's no separate build step to run first. Assets are under
`/q/build/` and `/q/assets/`; the app renders at `/`.

> If a rebuild ever misbehaves, run `pnpm nx reset` (not just `rm -rf .nx/cache`) —
> a stale Nx daemon can otherwise 500 the SSR `build.preview` step on a missing manifest.

## Stack

- Nx 23.1.0 + @nx/vite, pnpm, Vite 8
- Qwik v2 (`@qwik.dev/core`, `@qwik.dev/router`) pinned to `pkg.pr.new` build 8785,
  which currently resolves to `2.0.0-beta.38`
