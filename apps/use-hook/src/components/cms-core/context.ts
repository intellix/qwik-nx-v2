import type { Component } from '@qwik.dev/core';
import { createContextId } from '@qwik.dev/core';

export const ComponentContextId = createContextId<Record<string, Component>>('cms-components');
