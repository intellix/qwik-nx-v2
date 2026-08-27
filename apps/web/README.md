# Using a hook to register all components

Lets say you have a CMS that dynamically loads components based on a name:

```ts
components: [
  { slug: 'banner' },
  { slug: 'accordion' },
  { slug: 'button' },
]
```

You have lots of components that you register. When the slug appears on the page, you want to load the code to render them:
```ts
{
  button: Button,
  banner: Banner,
  accordion: Accordion,
  unused: Unused,
}
```

You have 2x routes:
- / (standard page, nothing on it)
- /about-cms/ (dynamic components from CMS)

## Behaviour

If you register them like this:

**root.tsx:**
```tsx
export default component$(() => {
  useCmsContextProvider();
  ...
```

with a hook for registering them:
```tsx
export const useCmsContextProvider = () => {
  useContextProvider(ComponentContextId, {
    button: Button,
    banner: Banner,
    accordion: Accordion,
    unused: Unused,
  });
}
```

You'll see this behaviour:

✅ MPA on Homepage
✅ MPA on /about-cms/
❌ SPA from Homepage to /about-cms/ - it loads all unused components
