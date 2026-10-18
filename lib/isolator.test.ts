import assert from "node:assert/strict";
import test from "node:test";
import { analyze, generate, GAMES } from "./gate";

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
