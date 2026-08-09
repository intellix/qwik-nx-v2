import { type Component, component$, useContext, useSignal, useTask$ } from '@qwik.dev/core';
import { ComponentContextId } from './context';
import type { CmsComponent } from './cms.types';

// Looks up the registered loader for `component.component` and renders it once resolved.
export const DynamicComponent = component$((props: { component: CmsComponent }) => {
  const components = useContext(ComponentContextId);
  const loader = components[props.component.component];

  const Cmp = useSignal<Component<Record<string, unknown>>>();
  useTask$(async () => {
    if (loader) {
      Cmp.value = await loader();
    }
  });

  const Resolved = Cmp.value;
  if (!Resolved) return null;

  return <Resolved key={props.component.id} {...props.component.data} />;
});
