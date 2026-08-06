import { component$ } from '@qwik.dev/core';
import type { DocumentHead } from '@qwik.dev/router';

export default component$(() => {
  return <h1>Qwik v2 + Nx — preview works under /q/ 🎉</h1>;
});

export const head: DocumentHead = {
  title: 'Qwik v2 + Nx',
};
