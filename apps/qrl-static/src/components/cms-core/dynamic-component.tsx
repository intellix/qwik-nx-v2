import { component$, useSignal, useTask$ } from '@qwik.dev/core';
import type { Component } from '@qwik.dev/core';
import { loadCmsComponent } from './registry';
import type { CmsComponent } from './cms.types';

export const DynamicComponent = component$((props: { component: CmsComponent }) => {
  const cmp = useSignal<Component<any>>();

  useTask$(async () => {
    cmp.value = await loadCmsComponent(props.component.component);
  });

  const Component = cmp.value;
  return Component ? <Component key={props.component.id} {...props.component.data} /> : null;
});
