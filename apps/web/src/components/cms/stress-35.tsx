import { $, component$, useComputed$, useSignal, useStore, useTask$, useVisibleTask$ } from '@qwik.dev/core';
import { sharedFormatter } from './shared-util';

interface Stress35Props {
  label: string;
  count: number;
}

export const Stress35 = component$<Stress35Props>((props) => {
  const local = useSignal(35);
  const store = useStore({ n: 0, s: 'init' });

  useTask$(({ track }) => {
    track(() => props.count);
    console.log('[Stress35] task-1', props.count);
  });

  useTask$(({ track }) => {
    track(() => local.value);
    console.log('[Stress35] task-2', local.value);
  });

  const derivedA = useComputed$(() => sharedFormatter(props.count + 35));
  const derivedB = useComputed$(() => `${props.label}-${store.n}`);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    console.log('[Stress35] visible-1 mounted');
    return () => console.log('[Stress35] visible-1 cleanup');
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => store.n);
    console.log('[Stress35] visible-2', store.n);
  });

  const onClick$ = $(() => {
    store.n += 1;
    local.value += 1;
  });

  const onSelect$ = $(() => {
    store.s = 'selected';
  });

  const onReset$ = $(() => {
    store.n = 0;
    store.s = 'init';
    local.value = 35;
  });

  return (
    <div>
      <h3>Stress35</h3>
      <p>{derivedA.value} / {derivedB.value}</p>
      <button onClick$={onClick$}>inc</button>
      <button onClick$={onSelect$}>select</button>
      <button onClick$={onReset$}>reset</button>
    </div>
  );
});
