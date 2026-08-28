import { $ } from '@qwik.dev/core';
import type { Component, QRL } from '@qwik.dev/core';

// Each value is a QRL wrapping a *dynamic import* of the component file.
export const cmsComponents: Record<string, QRL<() => Promise<Component<any>>>> = {
  button: $(() => import('../cms/button').then((m) => m.Button)),
  banner: $(() => import('../cms/banner').then((m) => m.Banner)),
  accordion: $(() => import('../cms/accordion').then((m) => m.Accordion)),
  'stress-1': $(() => import('../cms/stress-1').then((m) => m.Stress1)),
  'stress-2': $(() => import('../cms/stress-2').then((m) => m.Stress2)),
  'stress-3': $(() => import('../cms/stress-3').then((m) => m.Stress3)),
  'stress-4': $(() => import('../cms/stress-4').then((m) => m.Stress4)),
  'stress-5': $(() => import('../cms/stress-5').then((m) => m.Stress5)),
  'stress-6': $(() => import('../cms/stress-6').then((m) => m.Stress6)),
  'stress-7': $(() => import('../cms/stress-7').then((m) => m.Stress7)),
  'stress-8': $(() => import('../cms/stress-8').then((m) => m.Stress8)),
  'stress-9': $(() => import('../cms/stress-9').then((m) => m.Stress9)),
  'stress-10': $(() => import('../cms/stress-10').then((m) => m.Stress10)),
  'stress-11': $(() => import('../cms/stress-11').then((m) => m.Stress11)),
  'stress-12': $(() => import('../cms/stress-12').then((m) => m.Stress12)),
  'stress-13': $(() => import('../cms/stress-13').then((m) => m.Stress13)),
  'stress-14': $(() => import('../cms/stress-14').then((m) => m.Stress14)),
  'stress-15': $(() => import('../cms/stress-15').then((m) => m.Stress15)),
  'stress-16': $(() => import('../cms/stress-16').then((m) => m.Stress16)),
  'stress-17': $(() => import('../cms/stress-17').then((m) => m.Stress17)),
  'stress-18': $(() => import('../cms/stress-18').then((m) => m.Stress18)),
  'stress-19': $(() => import('../cms/stress-19').then((m) => m.Stress19)),
  'stress-20': $(() => import('../cms/stress-20').then((m) => m.Stress20)),
  'stress-21': $(() => import('../cms/stress-21').then((m) => m.Stress21)),
  'stress-22': $(() => import('../cms/stress-22').then((m) => m.Stress22)),
  'stress-23': $(() => import('../cms/stress-23').then((m) => m.Stress23)),
  'stress-24': $(() => import('../cms/stress-24').then((m) => m.Stress24)),
  'stress-25': $(() => import('../cms/stress-25').then((m) => m.Stress25)),
  'stress-26': $(() => import('../cms/stress-26').then((m) => m.Stress26)),
  'stress-27': $(() => import('../cms/stress-27').then((m) => m.Stress27)),
  'stress-28': $(() => import('../cms/stress-28').then((m) => m.Stress28)),
  'stress-29': $(() => import('../cms/stress-29').then((m) => m.Stress29)),
  'stress-30': $(() => import('../cms/stress-30').then((m) => m.Stress30)),
  'stress-31': $(() => import('../cms/stress-31').then((m) => m.Stress31)),
  'stress-32': $(() => import('../cms/stress-32').then((m) => m.Stress32)),
  'stress-33': $(() => import('../cms/stress-33').then((m) => m.Stress33)),
  'stress-34': $(() => import('../cms/stress-34').then((m) => m.Stress34)),
  'stress-35': $(() => import('../cms/stress-35').then((m) => m.Stress35)),
  'stress-36': $(() => import('../cms/stress-36').then((m) => m.Stress36)),
  'stress-37': $(() => import('../cms/stress-37').then((m) => m.Stress37)),
  'stress-38': $(() => import('../cms/stress-38').then((m) => m.Stress38)),
  'stress-39': $(() => import('../cms/stress-39').then((m) => m.Stress39)),
  'stress-40': $(() => import('../cms/stress-40').then((m) => m.Stress40)),
  'stress-41': $(() => import('../cms/stress-41').then((m) => m.Stress41)),
  'stress-42': $(() => import('../cms/stress-42').then((m) => m.Stress42)),
  'stress-43': $(() => import('../cms/stress-43').then((m) => m.Stress43)),
  'stress-44': $(() => import('../cms/stress-44').then((m) => m.Stress44)),
  'stress-45': $(() => import('../cms/stress-45').then((m) => m.Stress45)),
  'stress-46': $(() => import('../cms/stress-46').then((m) => m.Stress46)),
  'stress-47': $(() => import('../cms/stress-47').then((m) => m.Stress47)),
  'stress-48': $(() => import('../cms/stress-48').then((m) => m.Stress48)),
  'stress-49': $(() => import('../cms/stress-49').then((m) => m.Stress49)),
  'stress-50': $(() => import('../cms/stress-50').then((m) => m.Stress50)),
};

export const loadCmsComponent = async (
  name: string,
): Promise<Component<any>> => {
  const loader = cmsComponents[name];
  if (!loader) {
    throw new Error(`Unknown CMS component "${name}"`);
  }
  const load = await loader.resolve();
  return load();
};
