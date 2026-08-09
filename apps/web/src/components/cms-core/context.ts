import type { Component, QRL } from '@qwik.dev/core';
import { createContextId } from '@qwik.dev/core';

export type ComponentLoader = QRL<() => Promise<Component>>;

// The CMS registry: string name → QRL loader that resolves to the component.
// Registered in root.tsx (non-interactive) so the loader QRLs don't get pulled
// into the interactive shell's speculative preload closure.
export const ComponentContextId =
  createContextId<Record<string, ComponentLoader>>('cms-components');
