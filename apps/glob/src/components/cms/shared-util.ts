// Shared util imported by every generated component — creates a fan-in edge
// from many component chunks to this one module, which the qwik-vite chunker
// then splits across many wrapper chunks.

export function sharedFormatter(n: number): string {
  return `n=${n.toString().padStart(4, '0')}`;
}
