# qwik-nx-v2

There are various issues from beta.42 with dynamically loading components. 

## Registration-strategy apps

Each app under [`apps/`](./apps) demonstrates one way of registering CMS
components dynamically, and each has its own README. See
[`apps/README.md`](./apps/README.md) for the measured comparison of what each
strategy loads.

Run any app in preview (production build + preview server):

```bash
npx nx run use-hook:preview     # http://localhost:4173  — useContextProvider hook
npx nx run static-map:preview   # http://localhost:4273  — { button: Button }
npx nx run qrl-static:preview   # http://localhost:4373  — { button: $(() => Button) }
npx nx run qrl-import:preview   # http://localhost:4473  — { button: $(() => import('./button')) }
npx nx run glob:preview         # http://localhost:4573  — import.meta.glob('../cms/*.tsx')
```

Or the dev server with `npx nx run <app>:serve` (ports 5173 / 5273 / 5373 / 5473 / 5573).