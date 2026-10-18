// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
const { SIGMA } = require('./config');
const PRIMES = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]);
const EASY = ['free', 'small'];

// Returns true if the combination passes every shape filter for the tier.
function passes(combo, a, tier = 'jackpot') {
  const { k, maxN } = a;
  const s = [...combo].sort((x, y) => x - y);
  if (s.length !== k || new Set(s).size !== k) return false;
  const sum = s.reduce((t, n) => t + n, 0);
  const ev = s.filter(n => n % 2 === 0).length;
  const hard = !EASY.includes(tier);

  // F2 not already drawn
  const key = s.join();
  if (a.corpus.some(d => [...d].sort((x, y) => x - y).join() === key)) return false;
  // F3 sum band
  const sig = SIGMA[tier] || 1.0;
  if (sum < Math.round(a.sMean - a.sSd * sig) || sum > Math.round(a.sMean + a.sSd * sig)) return false;
  // F4 parity
  if (ev === 0 || ev === k) return false;
  if (['major', 'jackpot'].includes(tier) && (ev < 2 || ev > k - 2)) return false;
  // F5 quarter coverage
  const qz = Math.ceil(maxN / 4);
  if (new Set(s.map(n => Math.floor((n - 1) / qz))).size < (k >= 7 ? 3 : 2)) return false;
  // F6 low and high ends covered
  if (hard) {
    if (!s.some(n => n <= Math.floor(maxN * 0.22))) return false;
    if (!s.some(n => n >= Math.floor(maxN * 0.67))) return false;
  }
  // F7 spread
  const spread = s[k - 1] - s[0];
  if (spread < 22 || spread > Math.floor(maxN * 0.92)) return false;
  // F8 run of consecutive numbers < 5, F9 adjacent pairs <= 2
  let run = 1, mx = 1, adj = 0;
  for (let i = 1; i < k; i++) {
    if (s[i] === s[i - 1] + 1) { run++; adj++; } else run = 1;
    mx = Math.max(mx, run);
  }
  if (mx >= 5) return false;
  if (hard && adj > 2) return false;
  // F10 gap variance
  const gaps = []; for (let i = 1; i < k; i++) gaps.push(s[i] - s[i - 1]);
  if (tier !== 'free') {
    const gm = gaps.reduce((t, x) => t + x, 0) / gaps.length;
    if (gaps.reduce((t, x) => t + (x - gm) ** 2, 0) / gaps.length < 2) return false;
  }
  // F11 mod-3 balance
  if (hard) {
    const m3 = [0, 0, 0]; s.forEach(n => m3[n % 3]++);
    if (Math.max(...m3) > (k >= 7 ? 4 : 3)) return false;
  }
  // F12 prime count
  if (hard && s.filter(n => PRIMES.has(n)).length > 3) return false;
  // F20 shared last digit, F21 max gap
  if (hard) {
    const ld = {}; s.forEach(n => { ld[n % 10] = (ld[n % 10] || 0) + 1; });
    if (Math.max(...Object.values(ld)) > 2) return false;
    if (Math.max(...gaps) > 20) return false;
  }
  return true;
}
module.exports = { passes };
