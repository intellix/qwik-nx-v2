import { component$ } from '@qwik.dev/core';
import { Link, routeLoader$, type DocumentHead } from '@qwik.dev/router';
import circle from './circle.svg?url';
import sound from './sound.mp3?url';

// routeLoader$ — in Qwik v2 these get a dedicated cacheable JSON endpoint
// (/…/q-loader-{id}.{hash}.json) fetched on client-side navigation.
export const useGreeting = routeLoader$(() => {
  return { message: 'hello from the server loader', when: 'server-side' };
});

export default component$(() => {
  const greeting = useGreeting();
  return (
    <div>
      <h1>About — routing works 🎉</h1>
      <p>This is a second route at /about, rendered by the router.</p>
      <p>Loader says: {greeting.value.message} ({greeting.value.when})</p>
      <p>Inlined SVG (small, becomes a data: URI): {circle}</p>
      <p>MP3 asset URL (large, emitted as a file): {sound}</p>
      <audio src={sound} controls />
      <br />
      <Link href="/">← Back home</Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'About · Qwik v2 + Nx',
};
