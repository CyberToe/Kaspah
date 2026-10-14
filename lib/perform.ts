import "server-only";

import { RANDOM_PROVIDER, SYSTEM_TRY_AGAIN } from "./constants";
import { activeLines } from "./data";
import { createReading, validateNumbers, type LottoRules, type Touches } from "./engine";
import { bucketsFromLines } from "./library";
import { parseSettings } from "./settings";
import { settingsRows } from "./data";
import type { LottoRow } from "./data";

export function rulesOf(lotto: LottoRow): LottoRules {
  return {
    mainCount: lotto.mainCount,
    mainMin: lotto.mainMin,
    mainMax: lotto.mainMax,
    bonusCount: lotto.bonusCount,
    bonusMin: lotto.bonusMin,
    bonusMax: lotto.bonusMax,
    bonusFromMainPool: lotto.bonusFromMainPool,
  };
}

export async function performReading(lotto: LottoRow, touches: Touches | null, timeZone?: string | null) {
  const config = parseSettings(await settingsRows());
  if (config.provider !== RANDOM_PROVIDER.name) {
    return { ok: false as const, message: SYSTEM_TRY_AGAIN, providerName: config.provider, providerVersion: "unconfigured" };
  }
  try {
    const draft = createReading({
      rules: rulesOf(lotto),
      refusalRate: config.refusalRate,
      weights: config.weights,
      library: bucketsFromLines(await activeLines()),
      touches,
      luckyInclusion: config.luckyInclusion,
      timeZone: timeZone ?? undefined,
    });
    if (draft.outcome === "numbers") {
      const problem = validateNumbers(rulesOf(lotto), draft.mainNumbers ?? [], draft.bonusNumbers ?? []);
      if (problem) {
        console.error("Reading failed validation.", problem);
        return { ok: false as const, message: SYSTEM_TRY_AGAIN, providerName: draft.providerName, providerVersion: draft.providerVersion };
      }
    }
    return { ok: true as const, draft, delay: config.guestDelaySeconds };
  } catch (error) {
    console.error("Reading provider failed.", error);
    return { ok: false as const, message: SYSTEM_TRY_AGAIN, providerName: RANDOM_PROVIDER.name, providerVersion: RANDOM_PROVIDER.version };
  }
}
