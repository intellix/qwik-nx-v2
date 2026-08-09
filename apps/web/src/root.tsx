import { component$ } from '@qwik.dev/core';
import { QwikRouterProvider, RouterOutlet } from '@qwik.dev/router';
import { useCmsContextProvider } from './components/cms-core/use-cms-context-provider';

export default component$(() => {
  // Register the CMS component loader map from root.tsx — non-interactive.
  // Doing this in an interactive layout instead would pull every registered
  // component's loader-QRL into the interactive shell chunk's static graph
  // (via the barrel edge on `@qwik-nx-v2/cms`) and speculatively preload them
  // on every page. Registering in root.tsx keeps the loaders truly lazy.
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
