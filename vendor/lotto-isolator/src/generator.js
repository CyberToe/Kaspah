// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
const { passes } = require('./filters');

function sample(maxN, k, rng) {
  const pool = Array.from({ length: maxN }, (_, i) => i + 1);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, k).sort((a, b) => a - b);
}

// Uniform rejection sampling over combinations that pass the filters.
function generate(a, { tier = 'jackpot', count = 5, rng = Math.random, maxAttempts = 500000 } = {}) {
  const out = []; const seen = new Set();
  for (let t = 0; t < maxAttempts && out.length < count; t++) {
    const c = sample(a.maxN, a.k, rng);
    const key = c.join('-');
    if (!seen.has(key) && passes(c, a, tier)) { seen.add(key); out.push(c); }
  }
  return out;
}
module.exports = { generate, sample };
