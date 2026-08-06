import { component$ } from '@qwik.dev/core';
import type { DocumentHead } from '@qwik.dev/router';

export default component$(() => {
  return <h1>Qwik v2 + Nx — app at /, assets under /q/ 🎉</h1>;
});

export const head: DocumentHead = {
  title: 'Qwik v2 + Nx',
};
