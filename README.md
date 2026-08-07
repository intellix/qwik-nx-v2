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
// Client build: relocate entry chunks, lazy chunks, AND assets.
const clientOutput = {
  assetFileNames: 'q/assets/[hash]-[name].[ext]',
  entryFileNames: 'q/build/[hash].js',
  chunkFileNames: 'q/build/[hash].qwik.js',
};
// SSR build: relocate ONLY assets, keep default entry/chunk names.
const ssrOutput = {
  assetFileNames: 'q/assets/[hash]-[name].[ext]',
};

export default defineConfig(({ isSsrBuild }) => ({
  // ...
  build: {
    rollupOptions: { output: isSsrBuild ? ssrOutput : clientOutput },
  },
  worker: { rollupOptions: { output: clientOutput } },
}));
```

Files now land at `dist/apps/web/client/q/build/*.qwik.js` and
`.../q/assets/*`. Qwik names manifest bundles relative to its `build/` assetsDir,
so with `q:base="/build/"` the browser resolves `/build/../q/build/x.js` →
`/q/build/x.js`. Serving from root, that's exactly where the file is → **200**.

Four caveats this example bakes in, each of which can independently break the app:

1. **Keep the SSR entry name stable — but still relocate SSR assets.** The same config
   drives the SSR build (`build.server`/`build.preview`, `vite build --ssr entry.*.tsx`).
   Applying `entryFileNames: 'q/build/[hash].js'` there would rename `entry.preview.js`
   to a hashed name, and Qwik's preview middleware — which looks for
   `server/entry.preview.js` — returns **400** ("Unable to find output … entry.preview").
   So the SSR build overrides **only `assetFileNames`** (`ssrOutput`), not the entry/chunk
   names. See the asset caveat below for *why the SSR build needs `assetFileNames` at all*.

1b. **`?url` assets must be relocated in the SSR build too.** An `import sound from
   './sound.mp3?url'` is resolved during **both** the client and SSR builds, and the
   SSR-resolved URL is what gets baked into the **server-rendered HTML**. If the SSR
   build uses default asset naming, that URL is `/assets/…mp3` while the file only
   physically exists at the client's `/q/assets/…mp3` → **404 on first paint** (before
   hydration swaps in the client value). This is subtle: small assets under Vite's
   `assetsInlineLimit` (4 KB) inline as `data:` URIs and hide the bug — you only see it
   with a larger asset.

   Two demos cover the common asset shapes, both verified to serve 200 from the
   production node server:
   - `apps/web/src/routes/about/` — assets in **server-rendered JSX** (a small inlined
     SVG and a larger emitted MP3).
   - `libs/sounds/` (a shared lib resolved via a tsconfig path alias) + the home route —
     a **map of `?url` sounds used in client event handlers**, mirroring a real
     `sounds.ts`. Every URL renders and resolves under `/q/assets/`.

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

## Production build — run from `dist` with plain `node`

`preview` uses Vite's dev/preview server. To exercise the *real* production server,
there's a standalone Node entry ([apps/web/src/entry.node-server.tsx](apps/web/src/entry.node-server.tsx))
bundled to `dist/apps/web/server/entry.node-server.js` and run with `node` — no Vite,
no Nx at runtime:

```bash
pnpm build      # nx run web:build → build.client + build.server (SSR node bundle)
pnpm start      # node dist/apps/web/server/entry.node-server.js  (PORT=3000 by default)
```

Then `curl http://localhost:3000/` and `/about/` render (200), and the assets under
`/q/build/*` and `/q/assets/*` serve (200) straight from `dist/apps/web/client`.

**The `/q/` gotcha that only bites the real server:** Qwik's Node middleware decides
what to serve as a static file via `isStaticPath`, which only treats `/build/*` and
`/assets/*` (plus `globalThis.__QWIK_BUILD_DIR__`/`__QWIK_ASSETS_DIR__`, defaulting to
those) as static. Since we relocated assets to `/q/`, the entry sets those globals so
the server serves them instead of 404ing:

```ts
(globalThis as { __QWIK_BUILD_DIR__?: string }).__QWIK_BUILD_DIR__ = 'q/build';
(globalThis as { __QWIK_ASSETS_DIR__?: string }).__QWIK_ASSETS_DIR__ = 'q/assets';
```

`vite preview` hides this because it serves any file by path; the Node server does not.

## Stack

- Nx 23.1.0 + @nx/vite, pnpm, Vite 8
- Qwik v2 (`@qwik.dev/core`, `@qwik.dev/router`) pinned to `pkg.pr.new` build 8785,
  which currently resolves to `2.0.0-beta.38`
