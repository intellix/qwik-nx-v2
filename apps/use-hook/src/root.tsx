import { component$ } from '@qwik.dev/core';
import { QwikRouterProvider, RouterOutlet } from '@qwik.dev/router';
import { useCmsContextProvider } from './components/cms-core/use-cms-context-provider';

export default component$(() => {
  // Register CMS Components
  useCmsContextProvider();

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
