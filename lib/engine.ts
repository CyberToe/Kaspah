import { RANDOM_PROVIDER } from "./constants";
import { nearSignificantDate } from "./dates";
import type { LibraryBuckets } from "./library";

export type Rng = () => number;

export type LottoRules = {
  mainCount: number;
  mainMin: number;
  mainMax: number;
  bonusCount: number;
  bonusMin: number | null;
  bonusMax: number | null;
  bonusFromMainPool: boolean;
};

export type Touches = {
  luckyNumbers: number[];
  names: string[];
  words: string[];
  dates: { date: string; label: string }[];
};

export type ReadingDraft = {
  outcome: "numbers" | "refusal";
  mainNumbers: number[] | null;
  bonusNumbers: number[] | null;
  confidenceLevel: number | null;
  sentimentMessage: string | null;
  personalNote: string | null;
  refusalMessage: string | null;
  providerName: string;
  providerVersion: string;
};

export function drawUnique(
  count: number,
  min: number,
  max: number,
  exclude: Set<number>,
  rng: Rng,
): number[] {
  if (count === 0) return [];
  const pool: number[] = [];
  for (let n = min; n <= max; n += 1) {
    if (!exclude.has(n)) pool.push(n);
  }
  if (count > pool.length) throw new Error("Number pool is smaller than the count required.");
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = swap;
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

export function drawConfidence(weights: number[], rng: Rng): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0 || weights.length !== 5) throw new Error("Confidence weights are not usable.");
  let roll = rng() * total;
  for (let index = 0; index < weights.length; index += 1) {
    roll -= weights[index]!;
    if (roll < 0) return index + 1;
  }
  return weights.length;
}

export function validateNumbers(rules: LottoRules, main: number[], bonus: number[]): string | null {
  if (main.length !== rules.mainCount) return "Main count does not match the lotto.";
  if (new Set(main).size !== main.length) return "Main numbers are not unique.";
  if (main.some((n) => n < rules.mainMin || n > rules.mainMax)) return "A main number is outside the range.";
  if (main.some((n, index) => index > 0 && n <= main[index - 1]!)) return "Main numbers are not sorted.";
  if (bonus.length !== rules.bonusCount) return "Bonus count does not match the lotto.";
  if (rules.bonusCount === 0) return null;
  if (new Set(bonus).size !== bonus.length) return "Bonus numbers are not unique.";
  if (bonus.some((n, index) => index > 0 && n < bonus[index - 1]!)) return "Bonus numbers are not sorted.";
  if (rules.bonusFromMainPool) {
    if (bonus.some((n) => n < rules.mainMin || n > rules.mainMax)) return "A bonus number is outside the main pool.";
    if (bonus.some((n) => main.includes(n))) return "A bonus number duplicates a main number.";
    return null;
  }
  if (rules.bonusMin == null || rules.bonusMax == null) return "Bonus range is missing.";
  if (bonus.some((n) => n < rules.bonusMin! || n > rules.bonusMax!)) return "A bonus number is outside its pool.";
  return null;
}

function pick<T>(items: T[], rng: Rng): T {
  if (!items.length) throw new Error("Message library is empty.");
  return items[Math.floor(rng() * items.length)]!;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function createReading(input: {
  rules: LottoRules;
  refusalRate: number;
  weights: number[];
  library: LibraryBuckets;
  touches: Touches | null;
  luckyInclusion: boolean;
  timeZone?: string;
  now?: Date;
  rng?: Rng;
}): ReadingDraft {
  const rng = input.rng ?? Math.random;
  const base = {
    providerName: RANDOM_PROVIDER.name,
    providerVersion: RANDOM_PROVIDER.version,
  };
  if (rng() < input.refusalRate) {
    const name = input.touches?.names[0]
      ? input.touches.names[Math.floor(rng() * input.touches.names.length)]
      : null;
    const useName = Boolean(name && input.library.refusalNames.length && rng() < 0.7);
    const refusalMessage = useName
      ? fill(pick(input.library.refusalNames, rng), { name: name! })
      : pick(input.library.refusals, rng);
    return {
      ...base,
      outcome: "refusal",
      mainNumbers: null,
      bonusNumbers: null,
      confidenceLevel: null,
      sentimentMessage: null,
      personalNote: null,
      refusalMessage,
    };
  }

  let included: number | null = null;
  const validLucky = [
    ...new Set(
      (input.touches?.luckyNumbers ?? []).filter(
        (n) => Number.isInteger(n) && n >= input.rules.mainMin && n <= input.rules.mainMax,
      ),
    ),
  ];
  let main: number[];
  if (input.luckyInclusion && validLucky.length && rng() < 0.5) {
    included = validLucky[Math.floor(rng() * validLucky.length)]!;
    const rest = drawUnique(
      input.rules.mainCount - 1,
      input.rules.mainMin,
      input.rules.mainMax,
      new Set([included]),
      rng,
    );
    main = [...rest, included].sort((a, b) => a - b);
  } else {
    main = drawUnique(input.rules.mainCount, input.rules.mainMin, input.rules.mainMax, new Set(), rng);
  }

  const bonus = input.rules.bonusFromMainPool
    ? drawUnique(input.rules.bonusCount, input.rules.mainMin, input.rules.mainMax, new Set(main), rng)
    : drawUnique(
        input.rules.bonusCount,
        input.rules.bonusMin ?? 1,
        input.rules.bonusMax ?? 1,
        new Set(),
        rng,
      );

  const confidenceLevel = drawConfidence(input.weights, rng);
  const sentimentMessage = pick(input.library.sentiments[confidenceLevel] ?? [], rng);
  const notes: string[] = [];
  const touches = input.touches;
  if (touches?.names.length && input.library.weaveNames.length) {
    const name = touches.names[Math.floor(rng() * touches.names.length)]!;
    notes.push(fill(pick(input.library.weaveNames, rng), { name }));
  }
  if (touches?.words.length && input.library.weaveWords.length) {
    const word = touches.words[Math.floor(rng() * touches.words.length)]!;
    notes.push(fill(pick(input.library.weaveWords, rng), { word }));
  }
  if (touches?.dates.length && input.timeZone && input.library.weaveDates.length) {
    const near = nearSignificantDate(touches.dates, input.timeZone, input.now ?? new Date());
    if (near) notes.push(fill(pick(input.library.weaveDates, rng), { label: near.label }));
  }
  if (included != null && input.library.luckyDisclosure.length) {
    notes.push(fill(pick(input.library.luckyDisclosure, rng), { n: String(included) }));
  }

  return {
    ...base,
    outcome: "numbers",
    mainNumbers: main,
    bonusNumbers: input.rules.bonusCount ? bonus : null,
    confidenceLevel,
    sentimentMessage,
    personalNote: notes.length ? notes.join(" ") : null,
    refusalMessage: null,
  };
}
