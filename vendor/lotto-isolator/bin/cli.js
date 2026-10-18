#!/usr/bin/env node
// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Unauthorized copying, distribution or use of this file is prohibited. See LICENSE.
'use strict';
const fs = require('fs');
const { analyze, generate, TIERS, GAMES } = require('../src');
const [game = 'lmax', tier = 'jackpot', count = '5', file = require('path').join(__dirname, '..', 'data', 'sample_lmax.json')] = process.argv.slice(2);
if (!GAMES[game] || !TIERS.includes(tier)) {
  console.error(`usage: lotto-gate <${Object.keys(GAMES).join('|')}> <${TIERS.join('|')}> [count] [draws.json]`);
  process.exit(1);
}
const a = analyze(game, JSON.parse(fs.readFileSync(file, 'utf8')));
generate(a, { tier, count: +count }).forEach(c => console.log(c.join('-')));
