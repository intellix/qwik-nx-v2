# Registration strategy: static references in a module map

A plain module-level object mapping slug → statically imported component.

**`src/components/cms-core/registry.ts`:**
```ts
import { Button, Banner, Accordion, Stress1, /* … */ Stress50 } from '../cms';

export const cmsComponents: Record<string, Component<any>> = {
  button: Button,
  banner: Banner,
  accordion: Accordion,
  'stress-1': Stress1,
  // … all 50 stress components
};
```

**`src/components/cms-core/dynamic-component.tsx`** — a synchronous lookup:
```tsx
import { cmsComponents } from './registry';

const Component = cmsComponents[props.component.component];
return <Component {...props.component.data} />;
```

## Behaviour (measured 2026-08-28)

Distinct stress components (of 50) fetched while showing `/about-cms/`, which
renders only a `banner`:

| Scenario | Result |
|----------|:------:|
| MPA load `/` (empty homepage) | ✅ 0 |
| MPA load `/about-cms/` | ❌ **50 — loads all unused components** |
| SPA nav `/` → `/about-cms/` | ✅ 0 |

## Why

The slug→component lookup lives inside the `DynamicComponent` QRL. Qwik's bundle
graph therefore lists **every** component the map can reach as a dependency of
that QRL. On a **fresh (MPA) load**, Qwik's preloader eagerly high-priority
fetches all of a rendered QRL's graph dependencies — so all 50 unused components
download even though only `banner` renders. (The served SSR HTML references none
of them; the fetches come from the client preloader.) On **SPA navigation** that
dependency set is not re-escalated, so it stays clean.

Wrapping the values in `$()` ([`qrl-static`](../qrl-static)), using dynamic
`import()` ([`qrl-import`](../qrl-import)), or `import.meta.glob`
([`glob`](../glob)) does **not** change this — all four behave identically. The
only strategy with different behaviour is the context [`use-hook`](../use-hook)
one (which instead fails on SPA nav). See [`apps/README.md`](../README.md).

## Run

```bash
npx nx run static-map:preview   # http://localhost:4273  (production build)
npx nx run static-map:serve     # http://localhost:5273  (dev)
```

Reproduce: hard-refresh `/about-cms/` and watch the Network tab fill with
`stress-*` chunks.
