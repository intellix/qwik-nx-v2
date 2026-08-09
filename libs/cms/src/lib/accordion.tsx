import { component$, useTask$, useVisibleTask$ } from '@qwik.dev/core';

interface AccordionProps {
  title: string;
  text: string;
}

export const Accordion = component$<AccordionProps>((props) => {
  useTask$(() => console.log('Accordion useTask$'));
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => console.log('Accordion useVisibleTask$'));

  return (
    <div>
      Accordion: {props.title} / {props.text}
    </div>
  );
});
