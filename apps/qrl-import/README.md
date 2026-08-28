# Registration strategy: `$()` wrapper around a dynamic `import()`

Each map value is a QRL that **dynamically imports** the component file — no
static imports at the top of the registry at all.

**`src/components/cms-core/registry.ts`:**
```ts
import { $ } from '@qwik.dev/core';

export const cmsComponents: Record<string, QRL<() => Promise<Component<any>>>> = {
  button: $(() => import('../cms/button').then((m) => m.Button)),
  banner: $(() => import('../cms/banner').then((m) => m.Banner)),
  'stress-1': $(() => import('../cms/stress-1').then((m) => m.Stress1)),
  // … all 50 stress components
};

export const loadCmsComponent = async (name: string): Promise<Component<any>> => {
  const loader = cmsComponents[name];
  if (!loader) throw new Error(`Unknown CMS component "${name}"`);
  const load = await loader.resolve();
  return load();
};
```

**`src/components/cms-core/dynamic-component.tsx`** resolves the QRL in a task:
```tsx
const cmp = useSignal<Component<any>>();
useTask$(async () => {
  cmp.value = await loadCmsComponent(props.component.component);
});
const Component = cmp.value;
return Component ? <Component {...props.component.data} /> : null;
```

This is the "textbook" lazy approach — the registry statically imports nothing,
and each component sits behind its own `import()`. It still doesn't help.

## Behaviour (measured 2026-08-28)

Distinct stress components (of 50) fetched while showing `/about-cms/`, which
renders only a `banner`:

| Scenario | Result |
|----------|:------:|
| MPA load `/` (empty homepage) | ✅ 0 |
| MPA load `/about-cms/` | ❌ **50 — loads all unused components** |
| SPA nav `/` → `/about-cms/` | ✅ 0 |

## Why

Even though every component is behind its own dynamic `import()`, those
`import()` edges are all reachable from the `DynamicComponent` QRL, so Qwik's
bundle graph still lists all 50 as dependencies of that QRL. On a **fresh (MPA)
load** the preloader eagerly (high priority) fetches every graph dependency of a
rendered QRL → all 50, despite only `banner` rendering. On **SPA nav** that set
isn't re-escalated, so it stays clean.

`import()` being "lazy" in Vite terms does not make it lazy to Qwik's preloader —
reachability in the bundle graph is what matters. Identical result to
[`static-map`](../static-map), [`qrl-static`](../qrl-static) and
[`glob`](../glob). See [`apps/README.md`](../README.md).

## Run

```bash
npx nx run qrl-import:preview   # http://localhost:4473  (production build)
npx nx run qrl-import:serve     # http://localhost:5473  (dev)
```

Reproduce: hard-refresh `/about-cms/` and watch the Network tab fill with
`stress-*` chunks.
