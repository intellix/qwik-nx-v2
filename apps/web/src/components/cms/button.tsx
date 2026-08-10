import { component$, useTask$, useVisibleTask$ } from '@qwik.dev/core';

interface ButtonProps {
  text: string;
}

export const Button = component$<ButtonProps>((props) => {
  useTask$(() => console.log('Button useTask$'));
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => console.log('Button useVisibleTask$'));

  return (
    <>
      Button: <button>{props.text}</button>
    </>
  );
});
