// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
const { GAMES } = require('./config');

// draws: array of number arrays (or {numbers:[...]}). Returns baseline stats.
function analyze(game, draws) {
  const { k, maxN } = GAMES[game];
  const corpus = draws.map(d => (Array.isArray(d) ? d : d.numbers));
  const sums = corpus.map(d => d.reduce((a, b) => a + b, 0));
  const n = sums.length;
  // theoretical mean/sd of the sum of k draws without replacement from 1..maxN
  const tMean = (k * (maxN + 1)) / 2;
  const tSd = Math.sqrt(((k * (maxN * maxN - 1)) / 12) * ((maxN - k) / (maxN - 1)));
  const useTheory = n < 40;
  const mean = useTheory ? tMean : sums.reduce((a, b) => a + b, 0) / n;
  const sd = useTheory ? tSd : Math.sqrt(sums.reduce((t, s) => t + (s - mean) ** 2, 0) / n);
  const freq = {};
  for (let i = 1; i <= maxN; i++) freq[i] = 0;
  corpus.forEach(d => d.forEach(x => { freq[x]++; }));
  return { game, k, maxN, corpus, sMean: mean, sSd: sd, freq };
}
module.exports = { analyze };
