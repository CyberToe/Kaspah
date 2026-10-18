import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEIGHTS } from "./constants";
import { createReading, validateNumbers, type LottoRules, type Touches } from "./engine";
import { bucketsFromLines, STARTER_LINES } from "./library";

const library = bucketsFromLines(STARTER_LINES);

const lotto649: LottoRules = {
  mainCount: 6,
  mainMin: 1,
  mainMax: 49,
  bonusCount: 1,
  bonusMin: 1,
  bonusMax: 49,
  bonusFromMainPool: true,
};

const powerball: LottoRules = {
  mainCount: 5,
  mainMin: 1,
  mainMax: 69,
  bonusCount: 1,
  bonusMin: 1,
  bonusMax: 26,
  bonusFromMainPool: false,
};

const euro: LottoRules = {
  mainCount: 5,
  mainMin: 1,
  mainMax: 50,
  bonusCount: 2,
  bonusMin: 1,
  bonusMax: 12,
  bonusFromMainPool: false,
};

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("validation rejects a broken set and accepts a legal one", () => {
  assert.equal(validateNumbers(lotto649, [1, 2, 3, 4, 5, 6], [7]), null);
  assert.match(validateNumbers(lotto649, [1, 2, 3, 4, 5], [7]) ?? "", /count/i);
  assert.match(validateNumbers(lotto649, [1, 2, 3, 4, 5, 5], [7]) ?? "", /unique/i);
  assert.match(validateNumbers(lotto649, [1, 2, 3, 4, 5, 6], [6]) ?? "", /duplicates/i);
  assert.match(validateNumbers(powerball, [1, 2, 3, 4, 5], [27]) ?? "", /pool/i);
  assert.equal(validateNumbers(powerball, [1, 2, 3, 4, 5], [5]), null);
  assert.equal(validateNumbers(euro, [1, 2, 3, 4, 5], [2, 9]), null);
});

test("a thousand random readings stay inside the rules", () => {
  const rules = [lotto649, powerball, euro];
  for (const rule of rules) {
    for (let i = 0; i < 1000; i += 1) {
      const reading = createReading({
        rules: rule,
        refusalRate: 0,
        weights: DEFAULT_WEIGHTS,
        library,
        touches: null,
        luckyInclusion: false,
        rng: mulberry32(i + rule.mainMax),
      });
      assert.equal(reading.outcome, "numbers");
      assert.equal(
        validateNumbers(rule, reading.mainNumbers ?? [], reading.bonusNumbers ?? []),
        null,
      );
      assert.ok(reading.confidenceLevel && reading.confidenceLevel >= 1 && reading.confidenceLevel <= 5);
      assert.ok(library.sentiments[reading.confidenceLevel!]?.includes(reading.sentimentMessage ?? ""));
      assert.equal(reading.personalNote, null);
      assert.equal(reading.providerName, "random");
    }
  }
});

test("refusals carry no numbers and land near the configured rate", () => {
  let refusals = 0;
  const total = 1000;
  for (let i = 0; i < total; i += 1) {
    const reading = createReading({
      rules: lotto649,
      refusalRate: 0.1,
      weights: DEFAULT_WEIGHTS,
      library,
      touches: null,
      luckyInclusion: false,
      rng: mulberry32(5000 + i),
    });
    if (reading.outcome === "refusal") {
      refusals += 1;
      assert.equal(reading.mainNumbers, null);
      assert.equal(reading.confidenceLevel, null);
      assert.equal(reading.sentimentMessage, null);
      assert.match(reading.refusalMessage ?? "", /ask|again|once more/i);
    }
  }
  assert.ok(refusals > 60 && refusals < 150, `refusals ${refusals}`);
});

test("higher feelings are rarer than quiet ones", () => {
  const counts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 4000; i += 1) {
    const reading = createReading({
      rules: lotto649,
      refusalRate: 0,
      weights: DEFAULT_WEIGHTS,
      library,
      touches: null,
      luckyInclusion: false,
      rng: mulberry32(9000 + i),
    });
    counts[reading.confidenceLevel ?? 0] += 1;
  }
  assert.ok(counts[5]! < counts[1]!);
  assert.ok(counts[5]! < counts[4]!);
});

test("personal touches stay out of the public feeling", () => {
  const touches: Touches = {
    luckyNumbers: [7, 99],
    names: ["Mina"],
    words: ["lantern"],
    dates: [{ date: "2020-10-14", label: "our anniversary" }],
  };
  const reading = createReading({
    rules: lotto649,
    refusalRate: 0,
    weights: DEFAULT_WEIGHTS,
    library,
    touches,
    luckyInclusion: false,
    timeZone: "UTC",
    now: new Date("2026-10-14T12:00:00Z"),
    rng: mulberry32(42),
  });
  assert.equal(reading.outcome, "numbers");
  assert.ok(!reading.sentimentMessage?.includes("Mina"));
  assert.match(reading.personalNote ?? "", /Mina/);
  assert.match(reading.personalNote ?? "", /lantern/);
  assert.match(reading.personalNote ?? "", /anniversary/);
});

test("lucky inclusion is off unless the flag is on, and never uses an invalid number", () => {
  const touches: Touches = { luckyNumbers: [7, 99], names: [], words: [], dates: [] };
  for (let i = 0; i < 40; i += 1) {
    const reading = createReading({
      rules: lotto649,
      refusalRate: 0,
      weights: DEFAULT_WEIGHTS,
      library,
      touches,
      luckyInclusion: false,
      rng: mulberry32(100 + i),
    });
    assert.ok(!reading.personalNote?.includes("lucky number"));
  }
  let included = 0;
  let skipped = 0;
  for (let i = 0; i < 80; i += 1) {
    const reading = createReading({
      rules: lotto649,
      refusalRate: 0,
      weights: DEFAULT_WEIGHTS,
      library,
      touches,
      luckyInclusion: true,
      rng: mulberry32(2000 + i),
    });
    assert.equal(validateNumbers(lotto649, reading.mainNumbers ?? [], reading.bonusNumbers ?? []), null);
    assert.ok(!reading.mainNumbers?.includes(99));
    if (reading.personalNote?.includes("lucky number 7")) {
      included += 1;
      assert.ok(reading.mainNumbers?.includes(7));
    } else {
      skipped += 1;
    }
  }
  assert.ok(included > 10 && skipped > 10);
});

test("forced mains keep isolator sets and skip bonus when the lotto has none", () => {
  const rules: LottoRules = {
    mainCount: 6,
    mainMin: 1,
    mainMax: 49,
    bonusCount: 0,
    bonusMin: null,
    bonusMax: null,
    bonusFromMainPool: false,
  };
  const mains = [4, 11, 19, 27, 33, 41];
  const reading = createReading({
    rules,
    refusalRate: 0,
    weights: DEFAULT_WEIGHTS,
    library,
    touches: null,
    luckyInclusion: false,
    mains,
    providerName: "isolator",
    providerVersion: "0.1.0",
    rng: mulberry32(9),
  });
  assert.equal(reading.outcome, "numbers");
  assert.deepEqual(reading.mainNumbers, mains);
  assert.equal(reading.bonusNumbers, null);
  assert.equal(reading.providerName, "isolator");
  assert.equal(validateNumbers(rules, reading.mainNumbers ?? [], reading.bonusNumbers ?? []), null);
});
