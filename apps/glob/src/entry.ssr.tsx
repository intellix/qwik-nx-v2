import { renderToStream, type RenderToStreamOptions } from '@qwik.dev/core/server';
import { getClientManifest } from '@qwik.dev/core/internal';
import Root from './root';

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest: getClientManifest(),
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
