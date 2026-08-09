#!/usr/bin/env node
// Generate N CMS components for the qwik-vite chunk-fanout stress test.
//
//   node scripts/generate-stress-test.mjs [count]
//
// Each component emits several Qwik segments (useTask$/useVisibleTask$/useComputed$/$()
// event handlers). Every segment becomes a separate .qwik.js chunk. We register all
// components through the same lazy CMS loader map, then measure `manifest.bundles`
// count vs. actual `.qwik.js` files on disk — the fanout ratio.
//
// Usage:
//   node scripts/generate-stress-test.mjs 30
//   pnpm nx run web:build
//   node scripts/measure-fanout.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COUNT = Number(process.argv[2] || 30);

const libDir = resolve(ROOT, 'libs/cms/src/lib');
const providerFile = resolve(ROOT, 'apps/web/src/components/cms-core/use-cms-context-provider.ts');
const catchallFile = resolve(ROOT, 'apps/web/src/routes/[...catchall]/index.tsx');
const barrelFile = resolve(ROOT, 'libs/cms/src/index.ts');

mkdirSync(libDir, { recursive: true });

// Component template — each generated component has several segments:
//   • 2 useTask$      → 2 chunks
//   • 2 useVisibleTask$ → 2 chunks
//   • 2 useComputed$  → 2 chunks
//   • 3 $() handlers  → 3 chunks
//   • the component$ body itself → 1 chunk
//   • captured QRL ref to a shared util (adds another chunk edge)
// Expected: ~10 segments per component + shared util deps.
function componentSource(idx, name) {
  return `import { $, component$, useComputed$, useSignal, useStore, useTask$, useVisibleTask$ } from '@qwik.dev/core';
import { sharedFormatter } from './shared-util';

interface ${name}Props {
  label: string;
  count: number;
}

export const ${name} = component$<${name}Props>((props) => {
  const local = useSignal(${idx});
  const store = useStore({ n: 0, s: 'init' });

  useTask$(({ track }) => {
    track(() => props.count);
    console.log('[${name}] task-1', props.count);
  });

  useTask$(({ track }) => {
    track(() => local.value);
    console.log('[${name}] task-2', local.value);
  });

  const derivedA = useComputed$(() => sharedFormatter(props.count + ${idx}));
  const derivedB = useComputed$(() => \`\${props.label}-\${store.n}\`);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    console.log('[${name}] visible-1 mounted');
    return () => console.log('[${name}] visible-1 cleanup');
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => store.n);
    console.log('[${name}] visible-2', store.n);
  });

  const onClick$ = $(() => {
    store.n += 1;
    local.value += 1;
  });

  const onSelect$ = $(() => {
    store.s = 'selected';
  });

  const onReset$ = $(() => {
    store.n = 0;
    store.s = 'init';
    local.value = ${idx};
  });

  return (
    <div>
      <h3>${name}</h3>
      <p>{derivedA.value} / {derivedB.value}</p>
      <button onClick$={onClick$}>inc</button>
      <button onClick$={onSelect$}>select</button>
      <button onClick$={onReset$}>reset</button>
    </div>
  );
});
`;
}

const sharedUtilSource = `// Shared util imported by every generated component — creates a fan-in edge
// from many component chunks to this one module, which the qwik-vite chunker
// then splits across many wrapper chunks.

export function sharedFormatter(n: number): string {
  return \`n=\${n.toString().padStart(4, '0')}\`;
}
`;

// Write the shared util.
writeFileSync(resolve(libDir, 'shared-util.ts'), sharedUtilSource);

// Generate N components with predictable names Stress1..StressN.
const names = [];
for (let i = 1; i <= COUNT; i++) {
  const name = `Stress${i}`;
  names.push(name);
  writeFileSync(resolve(libDir, `stress-${i}.tsx`), componentSource(i, name));
}

// Rewrite the barrel to include everything.
const barrelSource = [
  `export * from './lib/accordion';`,
  `export * from './lib/banner';`,
  `export * from './lib/button';`,
  `export * from './lib/unused';`,
  `export * from './lib/shared-util';`,
  ...names.map((_, i) => `export * from './lib/stress-${i + 1}';`),
  '',
].join('\n');
writeFileSync(barrelFile, barrelSource);

// Rewrite the CMS loader map — each generated component gets a dynamic import.
const providerEntries = names
  .map((n, i) => `    'stress-${i + 1}': $(() => import('@qwik-nx-v2/cms').then((m) => m.${n})),`)
  .join('\n');

const providerSource = `import { $, useContextProvider } from '@qwik.dev/core';
import { ComponentContextId } from './context';

// Registers the CMS component loader map. See the sibling doc comment for why
// this must be called from root.tsx (non-interactive).
export const useCmsContextProvider = () => {
  useContextProvider(ComponentContextId, {
    button: $(() => import('@qwik-nx-v2/cms').then((m) => m.Button)),
    banner: $(() => import('@qwik-nx-v2/cms').then((m) => m.Banner)),
    accordion: $(() => import('@qwik-nx-v2/cms').then((m) => m.Accordion)),
    unused: $(() => import('@qwik-nx-v2/cms').then((m) => m.Unused)),
${providerEntries}
  });
};
`;
writeFileSync(providerFile, providerSource);

// Add a route that renders every generated component so nothing tree-shakes away.
const bodyEntries = names
  .map((_, i) => `      { id: ${i + 100}, component: 'stress-${i + 1}', data: { label: 'S${i + 1}', count: ${i} } },`)
  .join('\n');

const catchallSource = `import { component$ } from '@qwik.dev/core';
import { routeLoader$, type DocumentHead, type DocumentHeadProps } from '@qwik.dev/router';
import { Story } from '../../components/cms-core/story';
import type { CmsStory } from '../../components/cms-core/cms.types';

export const useStory = routeLoader$<CmsStory | undefined>((event) => {
  const pathname = event.url.pathname;
  const stressBody = [
${bodyEntries}
  ];
  return {
    '/stress/': { title: 'Stress', body: stressBody },
    '/home/': {
      title: 'Home',
      body: [
        { id: 1, component: 'banner', data: { image: 'home.jpg' } },
        { id: 2, component: 'accordion', data: { title: 'Home FAQ', text: 'Meh...' } },
        { id: 3, component: 'button', data: { text: 'Click me' } },
      ],
    },
    '/about-cms/': {
      title: 'About (CMS-rendered)',
      body: [{ id: 4, component: 'banner', data: { image: 'about.jpg' } }],
    },
    '/contact/': {
      title: 'Contact',
      body: [
        { id: 5, component: 'banner', data: { image: 'contact.jpg' } },
        { id: 6, component: 'accordion', data: { title: 'Contact FAQ', text: 'Meh...' } },
      ],
    },
  }[pathname];
});

export default component$(() => {
  const story = useStory();
  return (
    <div>
      <h1>{story.value?.title ?? 'No story for this path'}</h1>
      <Story story={story} />
    </div>
  );
});

export const head = (props: DocumentHeadProps): DocumentHead => {
  const story = props.resolveValue(useStory);
  return {
    title: story?.title ?? 'No Title',
    meta: [{ name: 'description', content: 'Qwik v2 + Nx CMS-driven page' }],
  };
};
`;
writeFileSync(catchallFile, catchallSource);

console.log(`Generated ${COUNT} stress components under libs/cms/src/lib/stress-*.tsx`);
console.log('Updated barrel, provider, and /stress/ catchall entry.');
console.log('\nNext:');
console.log('  pnpm nx run web:build');
console.log('  node scripts/measure-fanout.mjs');
