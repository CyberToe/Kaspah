// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { analyze, passes, generate } = require('../src');
const draws = require('../data/sample_lmax.json');
const a = analyze('lmax', draws);

test('rejects all-even, long runs and already-drawn combos', () => {
  assert.equal(passes([2, 4, 10, 20, 30, 40, 50], a, 'jackpot'), false);
  assert.equal(passes([1, 2, 3, 4, 5, 6, 7], a, 'free'), false);
  assert.equal(passes(draws[0].numbers, a, 'free'), false);
});
test('generated combos are valid and pass the filters', () => {
  const out = generate(a, { tier: 'mid', count: 5 });
  assert.equal(out.length, 5);
  out.forEach(c => { assert.equal(new Set(c).size, 7); assert.ok(passes(c, a, 'mid')); });
});
test('theoretical sum stats are sane for 7/52', () => {
  assert.equal(a.sMean > 150 && a.sMean < 210, true);
});
