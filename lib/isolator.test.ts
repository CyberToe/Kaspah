import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { GAMES, analyze, generate } = require("lotto-gate-core") as {
  GAMES: Record<string, { k: number; maxN: number }>;
  analyze: (game: string, draws: unknown[]) => { k: number; maxN: number };
  generate: (
    analysis: { k: number; maxN: number },
    options?: { tier?: string; count?: number; rng?: () => number },
  ) => number[][];
};

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("isolator games match the wired catalogue shapes", () => {
  assert.equal(GAMES.lmax.k, 7);
  assert.equal(GAMES.lmax.maxN, 52);
  assert.equal(GAMES.qmax.k, 7);
  assert.equal(GAMES.qmax.maxN, 52);
  assert.equal(GAMES.l649.k, 6);
  assert.equal(GAMES.l649.maxN, 49);
  assert.equal(GAMES.q49.k, 6);
  assert.equal(GAMES.q49.maxN, 49);
});

test("isolator can sample a mid-tier 6/49 set from an empty history", () => {
  const analysis = analyze("l649", []);
  const [combo] = generate(analysis, { tier: "mid", count: 1, rng: mulberry32(42) });
  assert.equal(combo.length, 6);
  assert.equal(new Set(combo).size, 6);
  assert.ok(combo.every((n) => n >= 1 && n <= 49));
  assert.deepEqual(combo, [...combo].sort((a, b) => a - b));
});
