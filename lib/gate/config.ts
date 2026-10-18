// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Ported from vendor/lotto-isolator for Vercel bundling. See vendor/lotto-isolator/LICENSE.

export const GAMES = {
  lmax: { name: "Lotto Max", k: 7, maxN: 52 },
  qmax: { name: "Quebec Max", k: 7, maxN: 52 },
  q49: { name: "Quebec 49", k: 6, maxN: 49 },
  l649: { name: "Lotto 6/49", k: 6, maxN: 49 },
} as const;

export type GateGameKey = keyof typeof GAMES;

export const SIGMA: Record<string, number> = {
  free: 1.75,
  small: 1.4,
  mid: 1.2,
  mid2: 1.2,
  major: 1.1,
  jackpot: 1.25,
};

export const TIERS = Object.keys(SIGMA);
