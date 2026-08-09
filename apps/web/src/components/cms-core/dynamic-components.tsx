import { component$ } from '@qwik.dev/core';
import type { CmsComponent } from './cms.types';
import { DynamicComponent } from './dynamic-component';

interface DynamicComponentsProps {
  components: CmsComponent[];
}

export const DynamicComponents = component$<DynamicComponentsProps>((props) => {
  return props.components?.map((c) => <DynamicComponent key={c.id} component={c} />);
});
