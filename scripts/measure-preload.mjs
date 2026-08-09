#!/usr/bin/env node
// Measure the Qwik preload closure — how many chunks the always-loaded shell
// speculatively reaches through the bundle graph. Reports both the shipped
// fan-out-cap-100 result AND the uncapped closure so you can see how much of
// the graph is theoretically reachable.
//
//   node scripts/measure-preload.mjs [dist]

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = process.argv[2] || 'dist/apps/web/client';
const m = JSON.parse(readFileSync(resolve(dist, 'q-manifest.json'), 'utf8'));
const g = JSON.parse(readFileSync(resolve(dist, m.bundleGraphAsset), 'utf8'));

function parseGraph(arr) {
  const map = new Map();
  let o = 0;
  while (o < arr.length) {
    const name = arr[o++];
    const deps = [];
    let s = 1, cur;
    while (((cur = arr[o]), typeof cur === 'number')) {
      if (cur < 0) s = -cur / 10;
      else deps.push({ B: arr[cur], S: s });
      o++;
    }
    map.set(name, deps);
  }
  return map;
}
const graph = parseGraph(g);
const orig = (n) => (m.bundles[n] || {}).origins || [];
const isJS = /\.[mc]?js$/;

const SHELL_HINTS = ['src/root.tsx', 'routes/layout.tsx', 'routes/layout'];
const shell = Object.keys(m.bundles).filter(
  (n) => isJS.test(n) && orig(n).some((o) => SHELL_HINTS.some((h) => o.includes(h))),
);

function simulate(seed, seedProb, fanoutCap) {
  const B = new Map();
  const get = (x) => {
    if (!graph.has(x)) return;
    let b = B.get(x);
    if (!b) {
      const h = graph.get(x);
      b = { u: 1, h: h && h.length ? h : undefined, js: isJS.test(x), queued: false };
      B.set(x, b);
    }
    return b;
  };
  let depsCount = 0, queued = 0;
  const adjust = (e, target, seen) => {
    if (seen?.has(e)) return;
    const prev = e.u;
    e.u = target;
    if (prev - e.u < 0.01) return;
    if (e.js && !e.queued) { e.queued = true; queued++; }
    if (e.h && e.h.length <= fanoutCap) {
      seen ||= new Set();
      seen.add(e);
      const t2 = 1 - e.u;
      for (const d of e.h) {
        const child = get(d.B);
        if (!child || child.u === 0) continue;
        let r;
        if (t2 === 1 || (t2 >= 0.99 && depsCount < 100)) {
          depsCount++;
          r = Math.min(0.01, 1 - d.S);
        } else {
          r = Math.max(0.02, child.u * (1 - d.S * t2));
        }
        adjust(child, r, seen);
      }
    }
  };
  const targetU = 1 - seedProb;
  for (let i = seed.length - 1; i >= 0; i--) {
    const b = get(seed[i]);
    if (b && b.u > targetU) { depsCount = 0; adjust(b, targetU); }
  }
  return queued;
}

// BFS at any strength (upper bound, no probabilistic pacing)
function reach(seed) {
  const seen = new Set(seed);
  const q = [...seed];
  while (q.length) {
    const cur = q.shift();
    for (const d of graph.get(cur) || []) {
      if (!seen.has(d.B)) { seen.add(d.B); q.push(d.B); }
    }
  }
  return [...seen].filter((n) => isJS.test(n)).length;
}

const total = Object.keys(m.bundles).length;
const capped = simulate(shell, 0.6, 100);
const uncapped = simulate(shell, 0.6, Infinity);
const bfs = reach(shell);

const pct = (n) => ((n / total) * 100).toFixed(1) + '%';

console.log(`── preload closure (dist: ${dist}) ──`);
console.log(`total bundles:              ${total}`);
console.log(`shell seeds:                ${shell.length}`);
console.log(`preload cap-100 (shipped):  ${capped}  (${pct(capped)})`);
console.log(`preload uncapped:           ${uncapped}  (${pct(uncapped)})`);
console.log(`reachable at any strength:  ${bfs}  (${pct(bfs)})`);
console.log(`symbols in manifest:        ${Object.keys(m.symbols || {}).length}`);
