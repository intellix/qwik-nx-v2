import { component$ } from '@qwik.dev/core';
import { cmsComponents } from './registry';
import type { CmsComponent } from './cms.types';

export const DynamicComponent = component$((props: { component: CmsComponent }) => {
  const Component = cmsComponents[props.component.component];
  return <Component key={props.component.id} {...props.component.data} />;
});
