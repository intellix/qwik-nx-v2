# qwik-nx-v2

Minimal Nx workspace running **Qwik v2** where `serve`, `build`, and **`preview`**
all work locally — a reference for fixing broken `preview` in Nx + Qwik v2 monorepos.

## The problem

Qwik apps served behind a load balancer often expose client assets under a path
prefix like `/q/`. The SSR entry makes the browser request chunks from
`/q/build/*.js`, but Qwik's client build physically emits them to
`dist/<app>/client/build/`, which a plain `vite preview` serves at `/build/*`.
In production a load balancer rewrites `/q/` -> the app root, so it works. Locally
there is no load balancer, so `vite preview` (and `@nx/vite:preview-server`) return
**404** for every `/q/build/*` chunk and the app never hydrates.

## The fix

Set `base: '/q/'` in `apps/web/vite.config.mts`. Vite then (1) emits client-asset
URLs under `/q/` and (2) mounts the preview static server at `/q/`, so
`/q/build/q-xxx.js` resolves to `client/build/q-xxx.js`. The SSR HTML and the
preview server finally agree — no load balancer needed.

See `apps/web/vite.config.mts` (the `base` line) and `apps/web/src/entry.ssr.tsx`.

There's a second, easy-to-miss piece: Qwik's preview middleware also needs an SSR
bundle (`dist/apps/web/server/entry.preview.js`), not just the client build. The
`web:preview` target `dependsOn` a `build.preview` target that runs
`vite build --ssr apps/web/src/entry.preview.tsx` to produce it — without that
dependency, preview has nothing to render even with `base` fixed.

## Run it

```bash
pnpm install
pnpm nx run web:serve      # dev SSR at http://localhost:5173/q/
pnpm nx run web:preview    # builds SSR + client, serves at http://localhost:4173/q/
```

`web:preview` auto-runs `build.preview` (which itself depends on `build.client`) via
Nx's `dependsOn`, so there's no separate build step to run first.

## Stack

- Nx 23.1.0 + @nx/vite, pnpm, Vite 8
- Qwik v2 (`@qwik.dev/core`, `@qwik.dev/router`) pinned to `pkg.pr.new` build 8785,
  which currently resolves to `2.0.0-beta.38`
