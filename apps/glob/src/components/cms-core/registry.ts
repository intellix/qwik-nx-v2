import type { Component } from '@qwik.dev/core';

type ComponentModule = Record<string, Component<any>>;
type ComponentLoader = () => Promise<ComponentModule>;

// Vite globs every CMS component file into a map of lazy loaders.
// Each value is `() => import("../cms/<name>.tsx")` — nothing loads until called.
const modules = import.meta.glob<ComponentModule>('../cms/*.tsx');

export const cmsComponents: Record<string, ComponentLoader> = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    const name = path.split('/').pop()!.replace(/\.tsx$/, '');
    return [name, loader];
  }),
);

export const loadCmsComponent = async (
  name: string,
): Promise<Component<any>> => {
  const loader = cmsComponents[name];
  if (!loader) {
    throw new Error(`Unknown CMS component "${name}"`);
  }
  const mod = await loader();
  const component = Object.values(mod)[0];
  if (!component) {
    throw new Error(`No component export found in "${name}"`);
  }
  return component;
};
