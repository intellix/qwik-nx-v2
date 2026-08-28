import { component$ } from '@qwik.dev/core';
import { routeLoader$ } from '@qwik.dev/router';
import type { CmsStory } from '../../components/cms-core/cms.types';
import { DynamicComponent } from '../../components/cms-core/dynamic-component';

export const useStory = routeLoader$<CmsStory | undefined>((event) => {
  const pathname = event.url.pathname;
  const stressBody = [
      { id: 100, component: 'stress-1', data: { label: 'S1', count: 0 } },
      { id: 101, component: 'stress-2', data: { label: 'S2', count: 1 } },
      { id: 102, component: 'stress-3', data: { label: 'S3', count: 2 } },
      { id: 103, component: 'stress-4', data: { label: 'S4', count: 3 } },
      { id: 104, component: 'stress-5', data: { label: 'S5', count: 4 } },
      { id: 105, component: 'stress-6', data: { label: 'S6', count: 5 } },
      { id: 106, component: 'stress-7', data: { label: 'S7', count: 6 } },
      { id: 107, component: 'stress-8', data: { label: 'S8', count: 7 } },
      { id: 108, component: 'stress-9', data: { label: 'S9', count: 8 } },
      { id: 109, component: 'stress-10', data: { label: 'S10', count: 9 } },
      { id: 110, component: 'stress-11', data: { label: 'S11', count: 10 } },
      { id: 111, component: 'stress-12', data: { label: 'S12', count: 11 } },
      { id: 112, component: 'stress-13', data: { label: 'S13', count: 12 } },
      { id: 113, component: 'stress-14', data: { label: 'S14', count: 13 } },
      { id: 114, component: 'stress-15', data: { label: 'S15', count: 14 } },
      { id: 115, component: 'stress-16', data: { label: 'S16', count: 15 } },
      { id: 116, component: 'stress-17', data: { label: 'S17', count: 16 } },
      { id: 117, component: 'stress-18', data: { label: 'S18', count: 17 } },
      { id: 118, component: 'stress-19', data: { label: 'S19', count: 18 } },
      { id: 119, component: 'stress-20', data: { label: 'S20', count: 19 } },
      { id: 120, component: 'stress-21', data: { label: 'S21', count: 20 } },
      { id: 121, component: 'stress-22', data: { label: 'S22', count: 21 } },
      { id: 122, component: 'stress-23', data: { label: 'S23', count: 22 } },
      { id: 123, component: 'stress-24', data: { label: 'S24', count: 23 } },
      { id: 124, component: 'stress-25', data: { label: 'S25', count: 24 } },
      { id: 125, component: 'stress-26', data: { label: 'S26', count: 25 } },
      { id: 126, component: 'stress-27', data: { label: 'S27', count: 26 } },
      { id: 127, component: 'stress-28', data: { label: 'S28', count: 27 } },
      { id: 128, component: 'stress-29', data: { label: 'S29', count: 28 } },
      { id: 129, component: 'stress-30', data: { label: 'S30', count: 29 } },
      { id: 130, component: 'stress-31', data: { label: 'S31', count: 30 } },
      { id: 131, component: 'stress-32', data: { label: 'S32', count: 31 } },
      { id: 132, component: 'stress-33', data: { label: 'S33', count: 32 } },
      { id: 133, component: 'stress-34', data: { label: 'S34', count: 33 } },
      { id: 134, component: 'stress-35', data: { label: 'S35', count: 34 } },
      { id: 135, component: 'stress-36', data: { label: 'S36', count: 35 } },
      { id: 136, component: 'stress-37', data: { label: 'S37', count: 36 } },
      { id: 137, component: 'stress-38', data: { label: 'S38', count: 37 } },
      { id: 138, component: 'stress-39', data: { label: 'S39', count: 38 } },
      { id: 139, component: 'stress-40', data: { label: 'S40', count: 39 } },
      { id: 140, component: 'stress-41', data: { label: 'S41', count: 40 } },
      { id: 141, component: 'stress-42', data: { label: 'S42', count: 41 } },
      { id: 142, component: 'stress-43', data: { label: 'S43', count: 42 } },
      { id: 143, component: 'stress-44', data: { label: 'S44', count: 43 } },
      { id: 144, component: 'stress-45', data: { label: 'S45', count: 44 } },
      { id: 145, component: 'stress-46', data: { label: 'S46', count: 45 } },
      { id: 146, component: 'stress-47', data: { label: 'S47', count: 46 } },
      { id: 147, component: 'stress-48', data: { label: 'S48', count: 47 } },
      { id: 148, component: 'stress-49', data: { label: 'S49', count: 48 } },
      { id: 149, component: 'stress-50', data: { label: 'S50', count: 49 } },
  ];
  return {
    '/stress/': { title: 'Stress', body: stressBody },
    '/home/': {
      title: 'Home',
      body: [
        { id: 1, component: 'banner', data: { image: 'home.jpg' } },
        { id: 2, component: 'accordion', data: { title: 'Home FAQ', text: 'Meh...' } },
        { id: 3, component: 'button', data: { text: 'Click me' } },
      ],
    },
    '/about-cms/': {
      title: 'About (CMS-rendered)',
      body: [{ id: 4, component: 'banner', data: { image: 'about.jpg' } }],
    },
    '/contact/': {
      title: 'Contact',
      body: [
        { id: 5, component: 'banner', data: { image: 'contact.jpg' } },
        { id: 6, component: 'accordion', data: { title: 'Contact FAQ', text: 'Meh...' } },
      ],
    },
  }[pathname];
});

export default component$(() => {
  const story = useStory();
  if (!story.value) {
    return <div>404</div>;
  }

  return (
    <div>
      <h1>{story.value?.title ?? 'No story for this path'}</h1>
      {story.value.body.map((c) => <DynamicComponent key={c.id} component={c} />)}
    </div>
  );
});
