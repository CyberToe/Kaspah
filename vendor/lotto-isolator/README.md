# lotto-gate-core

Backend-only core (Node >= 18, no dependencies): shape filters and a constrained
combination sampler for 7/52 and 6/49 games.

```
npm test
node bin/cli.js lmax mid 5
```

- `src/stats.js`  baseline stats (sum mean/sd, frequencies)
- `src/filters.js` shape filters (sum band, parity, coverage, spread, runs, gaps, mod-3, primes, last digit)
- `src/generator.js` rejection sampler over combinations that pass the filters
- `data/sample_lmax.json` small sample of draws for demos and tests

Lotteries are random; these filters shape combinations, they do not predict draws.

## Confidential
Private repository. Proprietary, all rights reserved (see `LICENSE`, `NOTICE.md`,
`DISCLAIMER.md`, `SECURITY.md`). Run `npm run prepush` before every push.
