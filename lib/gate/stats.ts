// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Ported from vendor/lotto-isolator for Vercel bundling. See vendor/lotto-isolator/LICENSE.

import { GAMES, type GateGameKey } from "./config";

export type GateDraw = number[] | { numbers: number[] };

export type GateAnalysis = {
  game: string;
  k: number;
  maxN: number;
  corpus: number[][];
  sMean: number;
  sSd: number;
  freq: Record<number, number>;
};

export function analyze(game: GateGameKey | string, draws: GateDraw[]): GateAnalysis {
  const def = GAMES[game as GateGameKey];
  if (!def) throw new Error(`Unknown isolator game: ${game}`);
  const { k, maxN } = def;
  const corpus = draws.map((d) => (Array.isArray(d) ? d : d.numbers));
  const sums = corpus.map((d) => d.reduce((a, b) => a + b, 0));
  const n = sums.length;
  const tMean = (k * (maxN + 1)) / 2;
  const tSd = Math.sqrt(((k * (maxN * maxN - 1)) / 12) * ((maxN - k) / (maxN - 1)));
  const useTheory = n < 40;
  const mean = useTheory ? tMean : sums.reduce((a, b) => a + b, 0) / n;
  const sd = useTheory ? tSd : Math.sqrt(sums.reduce((t, s) => t + (s - mean) ** 2, 0) / n);
  const freq: Record<number, number> = {};
  for (let i = 1; i <= maxN; i += 1) freq[i] = 0;
  corpus.forEach((d) => d.forEach((x) => {
    freq[x] = (freq[x] ?? 0) + 1;
  }));
  return { game, k, maxN, corpus, sMean: mean, sSd: sd, freq };
}
