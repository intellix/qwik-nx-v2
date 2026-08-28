# Registration strategy: `import.meta.glob`

Let Vite discover the component files and build the loader map automatically —
no hand-maintained list.

**`src/components/cms-core/registry.ts`:**
```ts
type ComponentModule = Record<string, Component<any>>;
type ComponentLoader = () => Promise<ComponentModule>;

// Lazy by default: values are `() => import("../cms/<name>.tsx")`.
const modules = import.meta.glob<ComponentModule>('../cms/*.tsx');

export const cmsComponents: Record<string, ComponentLoader> = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    const name = path.split('/').pop()!.replace(/\.tsx$/, '');
    return [name, loader];
  }),
);

export const loadCmsComponent = async (name: string): Promise<Component<any>> => {
  const loader = cmsComponents[name];
  if (!loader) throw new Error(`Unknown CMS component "${name}"`);
  const mod = await loader();
  const component = Object.values(mod)[0]; // each file has one component export
  if (!component) throw new Error(`No component export found in "${name}"`);
  return component;
};
```

**`src/components/cms-core/dynamic-component.tsx`** resolves it in a task:
```tsx
const cmp = useSignal<Component<any>>();
useTask$(async () => {
  cmp.value = await loadCmsComponent(props.component.component);
});
const Component = cmp.value;
return Component ? <Component {...props.component.data} /> : null;
```

Best ergonomics — drop a new file in `cms/` and it registers itself, no edits.
Same loading behaviour as the hand-written map variants, though.

## Behaviour (measured 2026-08-28)

Distinct stress components (of 50) fetched while showing `/about-cms/`, which
renders only a `banner`:

| Scenario | Result |
|----------|:------:|
| MPA load `/` (empty homepage) | ✅ 0 |
| MPA load `/about-cms/` | ❌ **50 — loads all unused components** |
| SPA nav `/` → `/about-cms/` | ✅ 0 |

## Why

`import.meta.glob` expands to one dynamic `import()` per file, all colocated in
the module the map lives in — which is reachable from the `DynamicComponent`
QRL. Qwik's bundle graph then lists all 50 as dependencies of that QRL, and on a
**fresh (MPA) load** the preloader eagerly high-priority fetches every one, even
though only `banner` renders. On **SPA nav** the set isn't re-escalated, so it
stays clean. (Confirmed by inspecting the bundle graph: the `DynamicComponent`
task bundle lists every `stress-*` bundle as a dependency.)

Identical result to [`static-map`](../static-map), [`qrl-static`](../qrl-static)
and [`qrl-import`](../qrl-import) — the discovery mechanism doesn't change the
preloader's behaviour. See [`apps/README.md`](../README.md).

Two caveats specific to this approach:
- `loadCmsComponent` uses `Object.values(mod)[0]`, so it assumes each file has
  exactly one export.
- The glob pattern must be a static string literal for Vite to expand it.

## Run

```bash
npx nx run glob:preview   # http://localhost:4573  (production build)
npx nx run glob:serve     # http://localhost:5573  (dev)
```

Reproduce: hard-refresh `/about-cms/` and watch the Network tab fill with
`stress-*` chunks.
