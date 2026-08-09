import { $, type Component, useContextProvider } from '@qwik.dev/core';
import { ComponentContextId } from './context';

// BAD PATTERN — the "static import + wrap-in-QRL" anti-pattern.
//
// Statically importing the components at top-of-file drags the ENTIRE `@qwik-nx-v2/cms`
// barrel into this file's static import graph. Since this hook is called from root.tsx
// (always-loaded shell), every component in the barrel — including `Unused` — is now
// statically reachable from the shell, regardless of whether any story ever names it.
//
// The `$(async () => X as Component)` wrapper looks lazy but does nothing: `X` is
// already loaded by the top import, so the QRL just returns an in-memory reference.
// Compare with use-cms-context-provider.ts, which uses `$(() => import(...).then(m => m.X))`
// — a genuine dynamic import that keeps the component out of the shell graph.
import { Accordion, Banner, Button, Unused } from '@qwik-nx-v2/cms';

export const useCmsContextProviderBad = () => {
  useContextProvider(ComponentContextId, {
    button: $(async () => Button as Component),
    banner: $(async () => Banner as Component),
    accordion: $(async () => Accordion as Component),
    unused: $(async () => Unused as Component),
  });
};
