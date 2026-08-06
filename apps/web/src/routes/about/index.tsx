import { component$ } from '@qwik.dev/core';
import { Link, type DocumentHead } from '@qwik.dev/router';

export default component$(() => {
  return (
    <div>
      <h1>About — routing works 🎉</h1>
      <p>This is a second route at /about, rendered by the router.</p>
      <Link href="/">← Back home</Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'About · Qwik v2 + Nx',
};
