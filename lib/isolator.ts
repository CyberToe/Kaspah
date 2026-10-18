import "server-only";

import { ISOLATOR_PROVIDER } from "./constants";
import { analyze, generate, GAMES, TIERS, type GateAnalysis, type GateDraw, type GateGameKey } from "./gate";
import l649 from "../data/isolator/l649.json";
import lmax from "../data/isolator/lmax.json";
import q49 from "../data/isolator/q49.json";
import qmax from "../data/isolator/qmax.json";

export type IsolatorGameKey = GateGameKey;

const LOTTO_TO_GAME: Record<string, IsolatorGameKey> = {
  "ca-lotto-max": "lmax",
  "ca-quebec-max": "qmax",
  "ca-649": "l649",
  "ca-quebec-49": "q49",
};

const DRAW_HISTORY: Record<IsolatorGameKey, GateDraw[]> = {
  lmax: lmax as GateDraw[],
  qmax: qmax as GateDraw[],
  l649: l649 as GateDraw[],
  q49: q49 as GateDraw[],
};

const analysisCache = new Map<string, GateAnalysis>();

export function isolatorGameFor(lottoId: string): IsolatorGameKey | null {
  return LOTTO_TO_GAME[lottoId] ?? null;
}

export function isolatorRules(game: IsolatorGameKey) {
  const def = GAMES[game];
  if (!def) throw new Error(`Unknown isolator game: ${game}`);
  return {
    mainCount: def.k,
    mainMin: 1,
    mainMax: def.maxN,
    bonusCount: 0,
    bonusMin: null as number | null,
    bonusMax: null as number | null,
    bonusFromMainPool: false,
  };
}

function analysisFor(game: IsolatorGameKey): GateAnalysis {
  const cached = analysisCache.get(game);
  if (cached) return cached;
  if (!GAMES[game]) throw new Error(`Unknown isolator game: ${game}`);
  const next = analyze(game, DRAW_HISTORY[game] ?? []);
  analysisCache.set(game, next);
  return next;
}

export function pickIsolatorCombo(
  lottoId: string,
  options?: { tier?: string; rng?: () => number },
): { mains: number[]; providerName: string; providerVersion: string; tier: string } {
  const game = isolatorGameFor(lottoId);
  if (!game) throw new Error(`Lotto ${lottoId} is not offered by the isolator.`);
  const tier = options?.tier && TIERS.includes(options.tier) ? options.tier : "mid";
  const [combo] = generate(analysisFor(game), {
    tier,
    count: 1,
    rng: options?.rng ?? Math.random,
    maxAttempts: 500_000,
  });
  if (!combo?.length) throw new Error("Isolator could not produce a combination.");
  return {
    mains: combo,
    providerName: ISOLATOR_PROVIDER.name,
    providerVersion: ISOLATOR_PROVIDER.version,
    tier,
  };
}
