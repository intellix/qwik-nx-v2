# Registration strategy: `useContextProvider` hook

Register all components by putting a map into a Qwik **context** from `root.tsx`.

**`src/root.tsx`:**
```tsx
export default component$(() => {
  useCmsContextProvider(); // provides the component map via context
  ...
});
```

**`src/components/cms-core/use-cms-context-provider.ts`:**
```tsx
import { Button, Banner, Accordion, Stress1, /* … */ Stress50 } from '../cms';

export const useCmsContextProvider = () => {
  useContextProvider(ComponentContextId, {
    button: Button,
    banner: Banner,
    accordion: Accordion,
    'stress-1': Stress1,
    // … all 50 stress components, statically imported
  });
};
```

**`src/components/cms-core/dynamic-component.tsx`** reads the map from context and
renders by slug:
```tsx
const components = useContext(ComponentContextId);
const Component = components[props.component.component];
return <Component {...props.component.data} />;
```

## Behaviour (measured 2026-08-28)

Distinct stress components (of 50) fetched while showing `/about-cms/`, which
renders only a `banner`:

| Scenario | Result |
|----------|:------:|
| MPA load `/` (empty homepage) | ✅ 0 |
| MPA load `/about-cms/` | ✅ 0 |
| SPA nav `/` → `/about-cms/` | ❌ **50 — loads all unused components** |

## Why

The component map lives in a Qwik **context**. On a fresh SSR load only the
component actually rendered (`banner`) is fetched. But on **client-side
navigation** the router serializes and transfers the context to the new route,
and because the context holds references to _every_ registered component, Qwik
pulls in all 50 unused chunks.

This is the inverse of the map-based apps ([`static-map`](../static-map),
[`qrl-static`](../qrl-static), [`qrl-import`](../qrl-import), [`glob`](../glob)),
which are clean on SPA nav but load everything on a fresh MPA load. See
[`apps/README.md`](../README.md) for the full comparison.

## Run

```bash
npx nx run use-hook:preview   # http://localhost:4173  (production build)
npx nx run use-hook:serve     # http://localhost:5173  (dev)
```

Reproduce: open `/`, then click the `/about-cms/` link, and watch the Network
tab fill with `stress-*` chunks.
