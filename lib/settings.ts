import {
  DEFAULT_GUEST_DELAY,
  DEFAULT_ISOLATOR_TIER,
  DEFAULT_REFUSAL_RATE,
  DEFAULT_WEIGHTS,
} from "./constants";

export type AppConfig = {
  refusalRate: number;
  weights: number[];
  provider: string;
  luckyInclusion: boolean;
  guestDelaySeconds: number;
  isolatorTier: string;
};

export function parseSettings(rows: { key: string; value: string }[]): AppConfig {
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const rate = Number(map.get("refusal_rate"));
  let weights = DEFAULT_WEIGHTS;
  try {
    const parsed = JSON.parse(map.get("confidence_weights") ?? "");
    if (Array.isArray(parsed) && parsed.length === 5 && parsed.every((n) => typeof n === "number" && n > 0)) {
      weights = parsed;
    }
  } catch {
    weights = DEFAULT_WEIGHTS;
  }
  const delay = Number(map.get("guest_delay"));
  const tier = map.get("isolator_tier") || DEFAULT_ISOLATOR_TIER;
  return {
    refusalRate: Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : DEFAULT_REFUSAL_RATE,
    weights,
    provider: map.get("active_provider") || "isolator",
    luckyInclusion: map.get("lucky_number_inclusion") === "true",
    guestDelaySeconds:
      Number.isFinite(delay) && delay >= 0 && delay <= 180 ? Math.round(delay) : DEFAULT_GUEST_DELAY,
    isolatorTier: tier,
  };
}
