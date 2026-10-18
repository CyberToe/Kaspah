// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Ported from vendor/lotto-isolator for Vercel bundling. See vendor/lotto-isolator/LICENSE.

import { passes } from "./filters";
import type { GateAnalysis } from "./stats";

export function sample(maxN: number, k: number, rng: () => number) {
  const pool = Array.from({ length: maxN }, (_, i) => i + 1);
  for (let i = 0; i < k; i += 1) {
    const j = i + Math.floor(rng() * (pool.length - i));
    const swap = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = swap;
  }
  return pool.slice(0, k).sort((a, b) => a - b);
}

export function generate(
  a: GateAnalysis,
  {
    tier = "jackpot",
    count = 5,
    rng = Math.random,
    maxAttempts = 500000,
  }: { tier?: string; count?: number; rng?: () => number; maxAttempts?: number } = {},
) {
  const out: number[][] = [];
  const seen = new Set<string>();
  for (let t = 0; t < maxAttempts && out.length < count; t += 1) {
    const c = sample(a.maxN, a.k, rng);
    const key = c.join("-");
    if (!seen.has(key) && passes(c, a, tier)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}
