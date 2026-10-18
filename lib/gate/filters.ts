// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Ported from vendor/lotto-isolator for Vercel bundling. See vendor/lotto-isolator/LICENSE.

import { SIGMA } from "./config";
import type { GateAnalysis } from "./stats";

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
const EASY = ["free", "small"];

export function passes(combo: number[], a: GateAnalysis, tier = "jackpot") {
  const { k, maxN } = a;
  const s = [...combo].sort((x, y) => x - y);
  if (s.length !== k || new Set(s).size !== k) return false;
  const sum = s.reduce((t, n) => t + n, 0);
  const ev = s.filter((n) => n % 2 === 0).length;
  const hard = !EASY.includes(tier);

  const key = s.join();
  if (a.corpus.some((d) => [...d].sort((x, y) => x - y).join() === key)) return false;

  const sig = SIGMA[tier] || 1.0;
  if (sum < Math.round(a.sMean - a.sSd * sig) || sum > Math.round(a.sMean + a.sSd * sig)) return false;

  if (ev === 0 || ev === k) return false;
  if (["major", "jackpot"].includes(tier) && (ev < 2 || ev > k - 2)) return false;

  const qz = Math.ceil(maxN / 4);
  if (new Set(s.map((n) => Math.floor((n - 1) / qz))).size < (k >= 7 ? 3 : 2)) return false;

  if (hard) {
    if (!s.some((n) => n <= Math.floor(maxN * 0.22))) return false;
    if (!s.some((n) => n >= Math.floor(maxN * 0.67))) return false;
  }

  const spread = s[k - 1]! - s[0]!;
  if (spread < 22 || spread > Math.floor(maxN * 0.92)) return false;

  let run = 1;
  let mx = 1;
  let adj = 0;
  for (let i = 1; i < k; i += 1) {
    if (s[i] === s[i - 1]! + 1) {
      run += 1;
      adj += 1;
    } else run = 1;
    mx = Math.max(mx, run);
  }
  if (mx >= 5) return false;
  if (hard && adj > 2) return false;

  const gaps: number[] = [];
  for (let i = 1; i < k; i += 1) gaps.push(s[i]! - s[i - 1]!);
  if (tier !== "free") {
    const gm = gaps.reduce((t, x) => t + x, 0) / gaps.length;
    if (gaps.reduce((t, x) => t + (x - gm) ** 2, 0) / gaps.length < 2) return false;
  }

  if (hard) {
    const m3 = [0, 0, 0];
    s.forEach((n) => {
      m3[n % 3]! += 1;
    });
    if (Math.max(...m3) > (k >= 7 ? 4 : 3)) return false;
  }

  if (hard && s.filter((n) => PRIMES.has(n)).length > 3) return false;

  if (hard) {
    const ld: Record<number, number> = {};
    s.forEach((n) => {
      ld[n % 10] = (ld[n % 10] || 0) + 1;
    });
    if (Math.max(...Object.values(ld)) > 2) return false;
    if (Math.max(...gaps) > 20) return false;
  }

  return true;
}
