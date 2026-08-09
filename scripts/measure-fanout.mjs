#!/usr/bin/env node
// Measure qwik-vite's chunk-fanout ratio: how many .qwik.js files land on disk
// per bundle Qwik tracks in q-manifest.json.
//
//   node scripts/measure-fanout.mjs [dist]
//
// Baseline for a small clean app: ~2×. Regressions (e.g. many QRL segments,
// deep loader graphs, shared-util fan-in) push this into 10×+ territory —
// each manifest bundle drags many hidden wrapper chunks the manifest doesn't list.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = process.argv[2] || 'dist/apps/web/client';
const manifestPath = resolve(dist, 'q-manifest.json');
const buildDir = resolve(dist, 'q/build');

const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
const manifestBundles = new Set(Object.keys(m.bundles).map((n) => n.replace(/^.*\//, '')));

const files = readdirSync(buildDir);
const qwikFiles = files.filter((f) => f.endsWith('.qwik.js'));
const known = qwikFiles.filter((f) => manifestBundles.has(f));
const unknown = qwikFiles.filter((f) => !manifestBundles.has(f));

const totalBytes = qwikFiles.reduce((s, f) => s + statSync(join(buildDir, f)).size, 0);
const knownBytes = known.reduce((s, f) => s + statSync(join(buildDir, f)).size, 0);
const unknownBytes = unknown.reduce((s, f) => s + statSync(join(buildDir, f)).size, 0);

const ratio = qwikFiles.length / manifestBundles.size;

console.log(`── qwik-vite chunk fanout (dist: ${dist}) ──`);
console.log(`manifest bundles:      ${manifestBundles.size}`);
console.log(`.qwik.js on disk:      ${qwikFiles.length}`);
console.log(`  known (in manifest): ${known.length}  (${(knownBytes / 1024 / 1024).toFixed(1)} MB)`);
console.log(`  unknown (wrappers):  ${unknown.length}  (${(unknownBytes / 1024 / 1024).toFixed(1)} MB)`);
console.log(`\nfanout ratio:          ${ratio.toFixed(2)}×`);
console.log(`total .qwik.js bytes:  ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`symbols in manifest:   ${Object.keys(m.symbols || {}).length}`);
console.log(`mapping entries:       ${Object.keys(m.mapping || {}).length}`);
