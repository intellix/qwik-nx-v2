import { component$, useTask$, useVisibleTask$ } from '@qwik.dev/core';

interface BannerProps {
  image: string;
}

export const Banner = component$<BannerProps>((props) => {
  useTask$(() => console.log('Banner useTask$'));
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => console.log('Banner useVisibleTask$'));

  return <div>Banner: {props.image}</div>;
});
