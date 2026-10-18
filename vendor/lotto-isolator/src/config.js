// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
// Game definitions (public rules only).
const GAMES = {
  lmax: { name: 'Lotto Max', k: 7, maxN: 52 },
  qmax: { name: 'Quebec Max', k: 7, maxN: 52 },
  q49:  { name: 'Quebec 49', k: 6, maxN: 49 },
  l649: { name: 'Lotto 6/49', k: 6, maxN: 49 },
};
// Strictness tiers. Higher tiers apply more filters and a tighter sum band.
const SIGMA = { free: 1.75, small: 1.4, mid: 1.2, mid2: 1.2, major: 1.1, jackpot: 1.25 };
const TIERS = Object.keys(SIGMA);
module.exports = { GAMES, SIGMA, TIERS };
