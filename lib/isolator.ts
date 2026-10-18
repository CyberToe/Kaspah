import "server-only";

import fs from "node:fs";
import path from "node:path";
import { analyze, generate, GAMES, TIERS, type IsolatorAnalysis } from "lotto-gate-core";
import { ISOLATOR_PROVIDER } from "./constants";

export type IsolatorGameKey = "lmax" | "qmax" | "l649" | "q49";

const LOTTO_TO_GAME: Record<string, IsolatorGameKey> = {
  "ca-lotto-max": "lmax",
  "ca-quebec-max": "qmax",
  "ca-649": "l649",
  "ca-quebec-49": "q49",
};

const analysisCache = new Map<string, IsolatorAnalysis>();

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

function drawsPath(game: IsolatorGameKey) {
  return path.join(process.cwd(), "data", "isolator", `${game}.json`);
}

function loadDraws(game: IsolatorGameKey): Array<number[] | { numbers: number[] }> {
  const file = drawsPath(game);
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
  return Array.isArray(raw) ? (raw as Array<number[] | { numbers: number[] }>) : [];
}

function analysisFor(game: IsolatorGameKey): IsolatorAnalysis {
  const cached = analysisCache.get(game);
  if (cached) return cached;
  if (!GAMES[game]) throw new Error(`Unknown isolator game: ${game}`);
  const next = analyze(game, loadDraws(game));
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
