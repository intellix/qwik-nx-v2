import { component$, type Signal } from '@qwik.dev/core';
import type { CmsStory } from './cms.types';
import { DynamicComponents } from './dynamic-components';

interface StoryProps {
  story: Signal<CmsStory | undefined>;
}

export const Story = component$<StoryProps>((props) => {
  const body = props.story.value?.body;
  if (!body) return null;
  return <DynamicComponents components={body} />;
});
