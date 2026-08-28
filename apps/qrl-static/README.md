# Registration strategy: `$()` wrapper around a static reference

Each map value is a QRL that returns a **statically imported** component.

**`src/components/cms-core/registry.ts`:**
```ts
import { $ } from '@qwik.dev/core';
import { Button, Banner, Accordion, Stress1, /* … */ Stress50 } from '../cms';

export const cmsComponents: Record<string, QRL<() => Component<any>>> = {
  button: $(() => Button),
  banner: $(() => Banner),
  'stress-1': $(() => Stress1),
  // … all 50 stress components
};

export const loadCmsComponent = async (name: string): Promise<Component<any>> => {
  const loader = cmsComponents[name];
  if (!loader) throw new Error(`Unknown CMS component "${name}"`);
  const load = await loader.resolve(); // QRL resolves to `() => Component`
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

> Note: the Qwik optimizer relocates the static `import { StressN }` into each
> `$()` segment, so the components _are_ still split into separate chunks — the
> `$()` wins over the static import. But it does not change the loading
> behaviour below.

## Behaviour (measured 2026-08-28)

Distinct stress components (of 50) fetched while showing `/about-cms/`, which
renders only a `banner`:

| Scenario | Result |
|----------|:------:|
| MPA load `/` (empty homepage) | ✅ 0 |
| MPA load `/about-cms/` | ❌ **50 — loads all unused components** |
| SPA nav `/` → `/about-cms/` | ✅ 0 |

## Why

Identical to [`static-map`](../static-map): the lookup lives in the
`DynamicComponent` QRL, whose Qwik bundle-graph dependencies include every
component the map can reach. On a **fresh (MPA) load** the preloader eagerly
fetches all of them (high priority) even though only `banner` renders; on **SPA
nav** that set isn't re-escalated. Wrapping in `$()` changes how the chunks are
_split_, not which ones the preloader pulls.

See [`apps/README.md`](../README.md) for the full comparison across all five
strategies.

## Run

```bash
npx nx run qrl-static:preview   # http://localhost:4373  (production build)
npx nx run qrl-static:serve     # http://localhost:5373  (dev)
```

Reproduce: hard-refresh `/about-cms/` and watch the Network tab fill with
`stress-*` chunks.
