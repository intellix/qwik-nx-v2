# Qwik v2 + Nx minimal working-preview example

**Date:** 2026-08-06
**Status:** Approved

## Purpose

Provide the smallest possible Nx workspace running **Qwik v2** where `serve`,
`build`, and — critically — **`preview`** all work. It mirrors the structure of
the `fenix-qwik` monorepo (`/Users/dom/Projects/github/ancientgaming/fenix-qwik`)
so that repo's broken `preview` can be fixed by diffing against a known-good
reference. The specific problem this example solves is the `/q/` client-asset
base path that breaks `vite preview` locally.

## The problem being reproduced (and fixed)

In fenix, `apps/*/src/entry.ssr.tsx` sets the client-chunk base to `/q/build`:

```ts
export function extractBase({ serverData }): string {
  // (+ locale suffix in prod)
  return '/q/build';
}
```

The SSR'd HTML therefore requests chunks from `/q/build/...`, but Qwik's client
build physically emits them to `dist/<app>/client/build/`, which a plain
`vite preview` serves at `/build/...`. Result: **404s and a broken preview**.
The `/q/` prefix only works in production because a load balancer forwards `/q/`
to the app; nothing does that locally.

## The fix

Set **`base: '/q/'`** in the app's `vite.config.mts`. Vite then:

1. Prefixes client asset URLs with `/q/`, and
2. Mounts the preview static server at `/q/`,

so a request for `/q/build/q-xxx.js` resolves to `client/build/q-xxx.js`.
Combined with `entry.ssr.tsx`'s `base = '/q/build'`, the SSR HTML and the preview
server agree, and preview works locally with no load balancer.

## Stack (matches fenix)

- Package manager: **pnpm** (`pnpm@10.11.1`)
- **Nx 23.1.x** (latest), `@nx/vite`
- **Qwik v2** pinned to the same `pkg.pr.new` prerelease as fenix:
  - `@qwik.dev/core` → `https://pkg.pr.new/QwikDev/qwik/@qwik.dev/core@8785`
  - `@qwik.dev/router` → `https://pkg.pr.new/QwikDev/qwik/@qwik.dev/router@8785`

## Scope

**In scope:** one app (`apps/web`), a single hello-world route, and working
`serve` / `build` / `preview` Nx targets.

**Out of scope (YAGNI):** Tailwind, Partytown, dev proxies, i18n/localized
routes, Storybook, multiple apps, shared libs, adapters/Docker/cloud-run.

## Layout

```
qwik-nx-v2/
  nx.json
  tsconfig.base.json
  package.json
  pnpm-workspace.yaml
  apps/web/
    vite.config.mts        # root:'apps/web', base:'/q/', split client/server
                           # outDir -> ../../dist/apps/web/{client,server}
    project.json           # @nx/vite targets
    tsconfig.json / tsconfig.app.json
    src/
      root.tsx
      entry.ssr.tsx        # base = '/q/build'
      entry.preview.tsx
      entry.dev.tsx
      routes/
        layout.tsx
        index.tsx
```

## Nx targets (mirror fenix's project.json)

- `serve`   → `@nx/vite:dev-server`     (mode: ssr, buildTarget: `web:build.client`)
- `build.client` → `@nx/vite:build`     (outputPath: `dist/apps/web`)
- `preview` → `@nx/vite:preview-server` (buildTarget: `web:build.client`,
              staticFilePath: `dist/apps/web/client`)

## vite.config.mts (shape)

- `root: 'apps/web'`
- `base: '/q/'`  ← the fix
- plugins: `qwikRouter()`, `qwikVite({ client: { outDir: '../../dist/apps/web/client' }, ssr: { outDir: '../../dist/apps/web/server' } })`, `tsconfigPaths({ root: '../../' })`
- `preview.outDir: '../../dist/apps/web/client'`

## Definition of done (verification)

Not "the server starts" — the page must actually render:

1. `pnpm nx build web` produces `dist/apps/web/client` + `server`.
2. `pnpm nx preview web` serves the app.
3. Loading the page returns HTTP 200 for the document **and** for the
   `/q/build/*.js` chunks, and the app hydrates (no 404s in the network log).
4. `pnpm nx serve web` also renders the app in dev (SSR) mode.

The example is the deliverable; a short `README.md` documents the `/q/` fix so
fenix can be diffed against it.
