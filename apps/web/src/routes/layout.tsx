import { component$, Slot } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';

export default component$(() => {
  return (
    <>
      <nav style="display:flex; gap:1rem; padding:0.75rem 1rem; border-bottom:1px solid #ddd;">
        <Link href="/">/</Link>
        <span style="opacity:0.5">CMS:</span>
        <Link href="/home/">/home/</Link>
        <Link href="/about-cms/">/about-cms/</Link>
        <Link href="/contact/">/contact/</Link>
      </nav>
      <main style="padding:1rem;">
        <Slot />
      </main>
    </>
  );
});
