// A shared library module (resolved across the package boundary via a tsconfig
// path alias, like fenix's @ancientgaming/csgr-utils) exporting a MAP of ?url
// asset URLs used by client-side event-handler segments.
import click from './audio/click.mp3?url';
import hover from './audio/hover.mp3?url';
import select from './audio/select.mp3?url';

export const SOUNDS = {
  click,
  hover,
  select,
} as const;

export type SoundName = keyof typeof SOUNDS;

export function play(name: SoundName) {
  new Audio(SOUNDS[name]).play();
}
