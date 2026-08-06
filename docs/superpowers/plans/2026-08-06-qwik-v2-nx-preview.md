# Qwik v2 + Nx Minimal Working-Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest Nx workspace running Qwik v2 where `serve`, `build`, and `preview` all work locally — including the `/q/` client-asset base that currently breaks `preview` in the fenix-qwik monorepo.

**Architecture:** A single Nx application (`apps/web`) with a hand-written `vite.config.mts` that mirrors fenix's layout (`root: 'apps/web'`, split client/server `outDir` into `dist/apps/web/{client,server}`). The one deliberate difference from fenix — and the entire point of the example — is `base: '/q/'` in the Vite config, which makes Vite emit client-chunk URLs under `/q/` **and** mount the preview static server at `/q/`, so the SSR HTML and the preview server agree with no load balancer.

**Tech Stack:** pnpm, Nx 23.1.0, `@nx/vite` 23.1.0, Vite ^8.1.5, Qwik v2 (`@qwik.dev/core` + `@qwik.dev/router`) pinned to `pkg.pr.new` build `8785`.

## Global Constraints

- Package manager: **pnpm**, pinned `packageManager: "pnpm@10.11.1"`.
- **Nx** and **@nx/vite** both exactly `23.1.0` (match fenix).
- **Vite** `^8.1.5`.
- Qwik v2 pinned to the same prerelease as fenix (copy verbatim):
  - `@qwik.dev/core`: `https://pkg.pr.new/QwikDev/qwik/@qwik.dev/core@8785`
  - `@qwik.dev/router`: `https://pkg.pr.new/QwikDev/qwik/@qwik.dev/router@8785`
- The Vite plugin export from the router is `qwikCity` (v2 kept the name), imported from `@qwik.dev/router/vite`.
- **`base: '/q/'`** in `apps/web/vite.config.mts` is load-bearing — the whole example fails its purpose without it.
- All Nx targets are **explicitly defined in `project.json`** (like fenix) — do NOT add `@nx/vite/plugin` inferred targets to `nx.json` (avoids target-name conflicts).
- `preview` depends only on the client build (`web:build.client`); Qwik's Vite plugin runs SSR at request time via `configurePreviewServer`, so no prebuilt server bundle is needed for preview.

---

## Task 1: Workspace scaffold

Create the root workspace files and install dependencies. Deliverable: `pnpm nx report` runs and lists `@nx/vite`.

**Files:**
- Modify: `package.json` (replace the existing stub)
- Create: `pnpm-workspace.yaml`
- Create: `nx.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

**Interfaces:**
- Produces: an installed Nx workspace resolvable by `pnpm nx <target> web`, with `@nx/vite:build|dev-server|preview-server` executors available and Qwik v2 packages installed.

- [ ] **Step 1: Replace `package.json`**

```json
{
  "name": "qwik-nx-v2",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.11.1",
  "scripts": {
    "build": "nx run web:build.client",
    "serve": "nx run web:serve",
    "preview": "nx run web:preview"
  },
  "devDependencies": {
    "@nx/vite": "23.1.0",
    "@qwik.dev/core": "https://pkg.pr.new/QwikDev/qwik/@qwik.dev/core@8785",
    "@qwik.dev/router": "https://pkg.pr.new/QwikDev/qwik/@qwik.dev/router@8785",
    "nx": "23.1.0",
    "typescript": "~5.9.2",
    "vite": "^8.1.5",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'libs/*'
```

- [ ] **Step 3: Create `nx.json`**

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  },
  "targetDefaults": {
    "@nx/vite:build": {
      "cache": true,
      "inputs": ["default", "^default"],
      "outputs": ["{workspaceRoot}/dist/apps/web"]
    }
  }
}
```

- [ ] **Step 4: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {}
  }
}
```

- [ ] **Step 5: Create `.gitignore`**

```gitignore
node_modules
dist
.nx/cache
.nx/workspace-data
node_modules/.vite
*.log
.DS_Store
tmp
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: completes without an unmet-peer/ERR_PNPM error that aborts install. The `pkg.pr.new` tarballs for `@qwik.dev/core` and `@qwik.dev/router` resolve.

- [ ] **Step 7: Verify Nx sees the workspace**

Run: `pnpm nx report`
Expected: prints an Nx report table listing `nx`, `@nx/vite` at `23.1.0`. No crash.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml nx.json tsconfig.base.json .gitignore pnpm-lock.yaml
git commit -m "chore: scaffold Nx 23 workspace with Qwik v2 deps"
```

---

## Task 2: Qwik v2 app (`apps/web`) that builds

Create the application source, Vite config, tsconfigs, and Nx project. Deliverable: `pnpm nx run web:build.client` produces `dist/apps/web/client` whose HTML references `/q/build/` chunks.

**Files:**
- Create: `apps/web/project.json`
- Create: `apps/web/vite.config.mts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.app.json`
- Create: `apps/web/src/root.tsx`
- Create: `apps/web/src/entry.ssr.tsx`
- Create: `apps/web/src/entry.preview.tsx`
- Create: `apps/web/src/entry.dev.tsx`
- Create: `apps/web/src/routes/layout.tsx`
- Create: `apps/web/src/routes/index.tsx`

**Interfaces:**
- Consumes: the installed workspace from Task 1.
- Produces: Nx project `web` with targets `build.client` (`@nx/vite:build`), `serve` (`@nx/vite:dev-server`), `preview` (`@nx/vite:preview-server`). Client build output at `dist/apps/web/client`, server output dir configured at `dist/apps/web/server`.

- [ ] **Step 1: Create `apps/web/project.json`**

```json
{
  "name": "web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/web/src",
  "targets": {
    "build.client": {
      "executor": "@nx/vite:build",
      "outputs": ["{workspaceRoot}/dist/apps/web"],
      "options": {
        "outputPath": "./dist/apps/web",
        "configFile": "./apps/web/vite.config.mts"
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": {
        "buildTarget": "web:build.client",
        "mode": "ssr",
        "port": 5173
      }
    },
    "preview": {
      "executor": "@nx/vite:preview-server",
      "options": {
        "buildTarget": "web:build.client",
        "staticFilePath": "dist/apps/web/client",
        "port": 4173
      }
    }
  }
}
```

- [ ] **Step 2: Create `apps/web/vite.config.mts`**

Note the `base: '/q/'` — this is the fix. Everything else mirrors fenix's config shape.

```ts
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
```

- [ ] **Step 3: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@qwik.dev/core",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["node", "vite/client"]
  },
  "files": [],
  "include": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

- [ ] **Step 4: Create `apps/web/tsconfig.app.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node", "vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "vite.config.mts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.tsx"
  ]
}
```

- [ ] **Step 5: Create `apps/web/src/root.tsx`**

```tsx
import { component$ } from '@qwik.dev/core';
import { QwikRouterProvider, RouterOutlet } from '@qwik.dev/router';

export default component$(() => {
  return (
    <QwikRouterProvider>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik v2 + Nx</title>
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikRouterProvider>
  );
});
```

- [ ] **Step 6: Create `apps/web/src/entry.ssr.tsx`**

Standard SSR entry. It does NOT set a custom `base` — Qwik derives the chunk base from Vite's `base: '/q/'`, so the emitted HTML requests `/q/build/*`.

```tsx
import { renderToStream, type RenderToStreamOptions } from '@qwik.dev/core/server';
import { getClientManifest } from '@qwik.dev/core/internal';
import Root from './root';

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest: getClientManifest(),
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
```

- [ ] **Step 7: Create `apps/web/src/entry.preview.tsx`**

```tsx
import { createQwikRouter, type QwikRouterNodeRequestOptions } from '@qwik.dev/router/middleware/node';
// The `render` import must stay after the config import.
import qwikRouterConfig from '@qwik-router-config';
import render from './entry.ssr';

export default createQwikRouter({ render, qwikRouterConfig } as QwikRouterNodeRequestOptions);
```

- [ ] **Step 8: Create `apps/web/src/entry.dev.tsx`**

```tsx
import { render, type RenderOptions } from '@qwik.dev/core';
import Root from './root';

export default function (opts: RenderOptions) {
  return render(document, <Root />, opts);
}
```

- [ ] **Step 9: Create `apps/web/src/routes/layout.tsx`**

```tsx
import { component$, Slot } from '@qwik.dev/core';

export default component$(() => {
  return <Slot />;
});
```

- [ ] **Step 10: Create `apps/web/src/routes/index.tsx`**

```tsx
import { component$ } from '@qwik.dev/core';
import type { DocumentHead } from '@qwik.dev/router';

export default component$(() => {
  return <h1>Qwik v2 + Nx — preview works under /q/ 🎉</h1>;
});

export const head: DocumentHead = {
  title: 'Qwik v2 + Nx',
};
```

- [ ] **Step 11: Run the client build (this is the test — it must fail loudly if config is wrong)**

Run: `pnpm nx run web:build.client`
Expected: PASS. Creates `dist/apps/web/client/` including a `dist/apps/web/client/build/` directory of `q-*.js` chunks, and an SSR/server manifest under `dist/apps/web/server/` (or an inline manifest). No unresolved-import errors for `@qwik.dev/*`.

- [ ] **Step 12: Verify the built HTML references the `/q/` base**

Run: `pnpm nx run web:build.client 2>/dev/null; grep -ro "/q/build/[a-zA-Z0-9._-]*\.js" dist/apps/web/client/*.html dist/apps/web/server 2>/dev/null | head`
Expected: at least one match printing a `/q/build/...js` path. (If the app is fully SSR with no static `index.html`, confirm instead in Task 3 via the running preview server — note that here and continue.)

- [ ] **Step 13: Commit**

```bash
git add apps/web
git commit -m "feat: add minimal Qwik v2 app with /q/ base"
```

---

## Task 3: Prove `preview` works end-to-end (the definition of done)

Start the preview server, confirm the document AND the `/q/build/*` chunks return HTTP 200, and confirm the `/q/` base is what makes it work. Deliverable: a passing verification run recorded in the README (Task 4).

**Files:**
- No source files created; this task verifies behavior. Uses a throwaway script under the scratchpad if helpful.

**Interfaces:**
- Consumes: the built app from Task 2 and the `preview` target.

- [ ] **Step 1: Build, then start the preview server in the background**

Run:
```bash
pnpm nx run web:build.client
pnpm nx run web:preview &   # serves on http://localhost:4173 under base /q/
```
Wait ~3s for "Local: http://localhost:4173/" to appear.

- [ ] **Step 2: Verify the document renders (test)**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4173/q/`
Expected: `200`. The Qwik app is served under the `/q/` base.

- [ ] **Step 3: Verify a client chunk resolves at `/q/build/` (the exact thing that 404s in fenix)**

Run:
```bash
CHUNK=$(curl -sS http://localhost:4173/q/ | grep -o '/q/build/[a-zA-Z0-9._-]*\.js' | head -1)
echo "chunk: $CHUNK"
curl -sS -o /dev/null -w "%{http_code}\n" "http://localhost:4173$CHUNK"
```
Expected: `chunk:` prints a real `/q/build/...js` path and the second curl prints `200`. This is the previously-broken path now working.

- [ ] **Step 4: Confirm the fix is load-bearing (reproduce the fenix bug, then restore)**

Temporarily prove that removing `base: '/q/'` reproduces the 404, then put it back:
```bash
# 1. comment out `base: '/q/',` in apps/web/vite.config.mts (edit the file)
pnpm nx run web:build.client
pnpm nx run web:preview &
# The SSR HTML still requests /q/build/* (Qwik default runtime base), but the
# static server now mounts at / -> the chunk 404s:
curl -sS -o /dev/null -w "without-base chunk: %{http_code}\n" "http://localhost:4173/q/build/anything.js"
# 2. restore `base: '/q/',` and rebuild
```
Expected: with `base` removed the chunk request is `404`; with it restored (Step 3) it is `200`. Restore the line before continuing. (If the executor prefers not to mutate the file, they may skip this demonstration step and rely on Steps 2–3 — note the skip.)

- [ ] **Step 5: Stop the preview server**

Run: `kill %1 2>/dev/null; kill %2 2>/dev/null` (or `pkill -f "vite preview"`).

- [ ] **Step 6: Verify serve (dev SSR) also works**

Run:
```bash
pnpm nx run web:serve &
sleep 4
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:5173/q/
kill %1 2>/dev/null; pkill -f "vite" 2>/dev/null
```
Expected: `200`. (Dev server also honors `base: '/q/'`.)

- [ ] **Step 7: Commit any restore edits (if Step 4 mutated files)**

```bash
git add -A
git commit -m "test: verify preview serves /q/ chunks (or 'no-op' if clean)" --allow-empty
```

---

## Task 4: README documenting the `/q/` fix

Write a short README so fenix can be diffed against this reference. Deliverable: `README.md` explaining the problem, the fix, and how to run each target.

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the verified commands from Task 3.

- [ ] **Step 1: Create `README.md`**

```markdown
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

## Run it

```bash
pnpm install
pnpm nx run web:serve      # dev SSR at http://localhost:5173/q/
pnpm nx run web:build.client
pnpm nx run web:preview    # preview at http://localhost:4173/q/
```

## Stack

- Nx 23.1.0 + @nx/vite, pnpm, Vite 8
- Qwik v2 (`@qwik.dev/core`, `@qwik.dev/router`) pinned to `pkg.pr.new` build 8785
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README documenting the /q/ preview fix"
```

---

## Self-Review Notes

- **Spec coverage:** Stack (Task 1), layout + targets + `/q/` base (Task 2), working
  serve/build/preview verification (Task 3), README documenting the fix (Task 4). All
  spec sections covered.
- **Known risk to watch during execution:** the exact router Vite export name
  (`qwikCity`) and the SSR base-derivation behavior are copied from fenix's working
  v2 setup; Task 2 Step 11 and Task 3 Steps 2–3 will surface any drift empirically.
  If `qwikCity` is not exported, check `@qwik.dev/router/vite` for `qwikRouter` and
  swap. If the built HTML does NOT reference `/q/build/` (Task 2 Step 12 empty), add
  the explicit runtime base back to `entry.ssr.tsx` (`base: '/q/build'`) — but verify
  Task 3 chunk 200s either way, since that is the true definition of done.
