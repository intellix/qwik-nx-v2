import { $, component$ } from '@qwik.dev/core';
import { Link, type DocumentHead } from '@qwik.dev/router';
import { SOUNDS, play } from '@qwik-nx-v2/sounds';

export default component$(() => {
  // Client-only handler segments referencing a shared ?url sound map — mirrors
  // fenix's sounds.ts usage.
  const onClick = $(() => play('click'));
  const onHover = $(() => play('hover'));
  const onSelect = $(() => play('select'));
  return (
    <div>
      <h1>Qwik v2 + Nx — app at /, assets under /q/ 🎉</h1>
      <button onClick$={onClick}>click sound</button>
      <button onMouseOver$={onHover}>hover sound</button>
      <button onFocus$={onSelect}>select sound</button>
      <p>sound map: {JSON.stringify(SOUNDS)}</p>
      <br />
      <Link href="/about">Go to /about →</Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Qwik v2 + Nx',
};
