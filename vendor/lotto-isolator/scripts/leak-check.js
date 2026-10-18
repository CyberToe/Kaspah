#!/usr/bin/env node
// Copyright (c) 2026 Gatuno Productions. All rights reserved. Proprietary and confidential.
// Fails if the repo contains secrets or references to logic that must stay private.
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const RULES = [
  [/sk-ant-[A-Za-z0-9_-]{10,}/, 'Anthropic API key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/x-api-key|apikey\s*[:=]/i, 'API key reference'],
  [/overdue|anticipat|droughtZone|drawScore|play_log|forbidden ?pair/i, 'private logic reference'],
];
const SKIP = new Set(['node_modules', '.git', 'leak-check.js']);
let bad = 0;
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (SKIP.has(f)) continue;
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (/\.(html?|log|env)$/i.test(f) || f === '.env') { console.error('FORBIDDEN FILE', path.relative(root, p)); bad++; continue; }
    const t = fs.readFileSync(p, 'utf8');
    for (const [re, label] of RULES) if (re.test(t)) { console.error(`${label}: ${path.relative(root, p)}`); bad++; }
  }
})(root);
if (bad) { console.error(`leak-check FAILED (${bad})`); process.exit(1); }
console.log('leak-check OK');
