import { createQwikRouter, type QwikRouterNodeRequestOptions } from '@qwik.dev/router/middleware/node';
// The `render` import must stay after the config import.
import qwikRouterConfig from '@qwik-router-config';
import render from './entry.ssr';

export default createQwikRouter({ render, qwikRouterConfig } as QwikRouterNodeRequestOptions);
