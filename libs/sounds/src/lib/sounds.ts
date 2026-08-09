// A shared library module (resolved across the package boundary via a tsconfig
// path alias) exporting a MAP of ?url asset URLs used by client-side
// event-handler segments.
import click from './audio/click.mp3?url';

export const SOUNDS = { click } as const;

export type SoundName = keyof typeof SOUNDS;

export function play(name: SoundName) {
  new Audio(SOUNDS[name]).play();
}
