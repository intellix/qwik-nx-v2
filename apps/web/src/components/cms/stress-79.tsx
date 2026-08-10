import { $, component$, useComputed$, useSignal, useStore, useTask$, useVisibleTask$ } from '@qwik.dev/core';
import { sharedFormatter } from './shared-util';

interface Stress79Props {
  label: string;
  count: number;
}

export const Stress79 = component$<Stress79Props>((props) => {
  const local = useSignal(79);
  const store = useStore({ n: 0, s: 'init' });

  useTask$(({ track }) => {
    track(() => props.count);
    console.log('[Stress79] task-1', props.count);
  });

  useTask$(({ track }) => {
    track(() => local.value);
    console.log('[Stress79] task-2', local.value);
  });

  const derivedA = useComputed$(() => sharedFormatter(props.count + 79));
  const derivedB = useComputed$(() => `${props.label}-${store.n}`);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    console.log('[Stress79] visible-1 mounted');
    return () => console.log('[Stress79] visible-1 cleanup');
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => store.n);
    console.log('[Stress79] visible-2', store.n);
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
    local.value = 79;
  });

  return (
    <div>
      <h3>Stress79</h3>
      <p>{derivedA.value} / {derivedB.value}</p>
      <button onClick$={onClick$}>inc</button>
      <button onClick$={onSelect$}>select</button>
      <button onClick$={onReset$}>reset</button>
    </div>
  );
});
