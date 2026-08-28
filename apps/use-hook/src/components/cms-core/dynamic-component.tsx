import { component$, useContext } from '@qwik.dev/core';
import { ComponentContextId } from './context';
import type { CmsComponent } from './cms.types';

export const DynamicComponent = component$((props: { component: CmsComponent }) => {
  const components = useContext(ComponentContextId);
  const Component = components[props.component.component];
  return <Component key={props.component.id} {...props.component.data} />;
});
