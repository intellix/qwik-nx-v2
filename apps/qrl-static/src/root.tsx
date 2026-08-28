import { component$ } from '@qwik.dev/core';
import { QwikRouterProvider, RouterOutlet } from '@qwik.dev/router';

export default component$(() => {
  return (
    <QwikRouterProvider>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik v2 + Nx</title>
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikRouterProvider>
  );
});
