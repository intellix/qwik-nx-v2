import { $, component$, useComputed$, useSignal, useStore, useTask$, useVisibleTask$ } from '@qwik.dev/core';
import { sharedFormatter } from './shared-util';

interface Stress33Props {
  label: string;
  count: number;
}

export const Stress33 = component$<Stress33Props>((props) => {
  const local = useSignal(33);
  const store = useStore({ n: 0, s: 'init' });

  useTask$(({ track }) => {
    track(() => props.count);
    console.log('[Stress33] task-1', props.count);
  });

  useTask$(({ track }) => {
    track(() => local.value);
    console.log('[Stress33] task-2', local.value);
  });

  const derivedA = useComputed$(() => sharedFormatter(props.count + 33));
  const derivedB = useComputed$(() => `${props.label}-${store.n}`);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    console.log('[Stress33] visible-1 mounted');
    return () => console.log('[Stress33] visible-1 cleanup');
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => store.n);
    console.log('[Stress33] visible-2', store.n);
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
    local.value = 33;
  });

  return (
    <div>
      <h3>Stress33</h3>
      <p>{derivedA.value} / {derivedB.value}</p>
      <button onClick$={onClick$}>inc</button>
      <button onClick$={onSelect$}>select</button>
      <button onClick$={onReset$}>reset</button>
    </div>
  );
});
