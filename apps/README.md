# CMS dynamic-component registration — the scenarios

A CMS returns a list of component slugs for a page:

```ts
body: [{ component: 'banner', data: { image: 'about.jpg' } }]
```

We register many components once, and render the ones a page asks for by slug.
The question every app here answers: **when a page uses only `banner`, does the
browser also download the code for all the _unused_ registered components?**

Each app is one registration strategy, 100% self-contained (copy of the same
base, only the registration differs). Every app registers the same set:
`button`, `banner`, `accordion`, and `stress-1 … stress-50` (50 deliberately
heavy, unused components), and has the same routes:

- `/` — empty homepage
- `/about-cms/` — renders **one** `banner`
- `/home/`, `/contact/` — a couple of components
- `/stress/` — renders all 50 stress components

The interesting page is **`/about-cms/`**: it renders a single banner, so a
healthy app should load the banner and _nothing else_.

## Measured behaviour

Distinct stress components (of 50) whose code the browser fetched while showing
`/about-cms/` — which renders only a banner. `0` = healthy, `50` = it downloaded
every unused component. Measured 2026-08-28 against `nx run <app>:preview`
(production build) driving headless Chrome over CDP.

| App | Strategy | MPA load `/` | MPA load `/about-cms/` | SPA nav `/` → `/about-cms/` |
|-----|----------|:---:|:---:|:---:|
| [`use-hook`](./use-hook)     | `useContextProvider({ button: Button })` | ✅ 0 | ✅ 0 | ❌ **50** |
| [`static-map`](./static-map) | `{ button: Button }` module map          | ✅ 0 | ❌ **50** | ✅ 0 |
| [`qrl-static`](./qrl-static) | `{ button: $(() => Button) }`             | ✅ 0 | ❌ **50** | ✅ 0 |
| [`qrl-import`](./qrl-import) | `{ button: $(() => import('./button')) }` | ✅ 0 | ❌ **50** | ✅ 0 |
| [`glob`](./glob)             | `import.meta.glob('../cms/*.tsx')`        | ✅ 0 | ❌ **50** | ✅ 0 |

**MPA load** = typing the URL / hard refresh (fresh SSR document).
**SPA nav** = landing on `/` first, then clicking the in-app link.

## The headline

**No strategy is clean in every scenario.**

- The **hook** is clean on fresh loads but downloads all 50 unused components on
  **client-side (SPA) navigation**.
- **Every map-based strategy** (plain, `$`-wrapped, `$`-import, glob) is clean on
  SPA navigation but downloads all 50 on a **fresh (MPA) load** of a CMS page.

The registration _style_ (static vs `$` vs dynamic `import()` vs glob) does **not**
change this — all four map variants behave identically. The split is between
"put the registry in a **context**" (fails on SPA) and "look the component up in
a **module/QRL map**" (fails on MPA).

### Why

It's Qwik's **preloader** driving these fetches, not the SSR HTML (the served
HTML references zero unused components in every case).

- **Map strategies fail on MPA load** because the lookup lives in the
  `DynamicComponent` QRL, and Qwik's bundle graph lists _every_ component that
  QRL can reach as a dependency. On a fresh container load the preloader
  eagerly (high-priority) fetches all of a rendered QRL's graph dependencies →
  all 50. On SPA nav that set isn't re-escalated, so it stays clean.
- **The hook fails on SPA nav** because the component map is placed in a Qwik
  **context**. Client navigation serializes/transfers that context, and because
  it holds references to all registered components, every one gets pulled in.

## Run one

```bash
npx nx run <app>:preview     # production build + preview server (see per-app README for port)
npx nx run <app>:serve       # dev server
```

Then open `/about-cms/` and watch the Network tab: filter for `stress` and
compare a hard refresh vs. navigating in from `/`.
