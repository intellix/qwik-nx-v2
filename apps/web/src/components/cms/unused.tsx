import { component$ } from '@qwik.dev/core';

// Barrel-test sibling — no importer references it directly. If the barrel
// tree-shakes correctly, this file should never appear in the client build.
// It only surfaces when a static consumer of the barrel drags every sibling in.
export const Unused = component$(() => {
  return <div>Unused — should not appear in the client build.</div>;
});
