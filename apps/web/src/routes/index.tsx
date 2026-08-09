import { $, component$ } from '@qwik.dev/core';
import { Link, type DocumentHead } from '@qwik.dev/router';
import { SOUNDS, play } from '@qwik-nx-v2/sounds';

export default component$(() => {
  // Client-only handler segment referencing a shared ?url sound map from a
  // sibling lib (resolved via a tsconfig path alias).
  const onClick = $(() => play('click'));
  return (
    <div>
      <h1>Qwik v2 + Nx — app at /, assets under /q/ 🎉</h1>
      <button onClick$={onClick}>click sound</button>
      <p>sound map: {JSON.stringify(SOUNDS)}</p>
      <br />
      <Link href="/about">Go to /about →</Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Qwik v2 + Nx',
};
