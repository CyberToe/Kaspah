import "server-only";

import { ISOLATOR_PROVIDER, RANDOM_PROVIDER, SYSTEM_TRY_AGAIN } from "./constants";
import { activeLines, settingsRows, type LottoRow } from "./data";
import { createReading, validateNumbers, type LottoRules, type Touches } from "./engine";
import { isolatorGameFor, pickIsolatorCombo } from "./isolator";
import { bucketsFromLines, type LibraryBuckets } from "./library";
import { parseSettings } from "./settings";

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

export async function performReading(
  lotto: LottoRow,
  touches: Touches | null,
  timeZone?: string | null,
  library?: LibraryBuckets,
) {
  const config = parseSettings(await settingsRows());
  const provider = config.provider === "random" ? RANDOM_PROVIDER.name : ISOLATOR_PROVIDER.name;
  if (provider === ISOLATOR_PROVIDER.name && !isolatorGameFor(lotto.id)) {
    return {
      ok: false as const,
      message: SYSTEM_TRY_AGAIN,
      providerName: ISOLATOR_PROVIDER.name,
      providerVersion: ISOLATOR_PROVIDER.version,
    };
  }

  try {
    let mains: number[] | undefined;
    let providerName: string = RANDOM_PROVIDER.name;
    let providerVersion: string = RANDOM_PROVIDER.version;
    if (provider === ISOLATOR_PROVIDER.name) {
      const picked = pickIsolatorCombo(lotto.id, { tier: config.isolatorTier });
      mains = picked.mains;
      providerName = picked.providerName;
      providerVersion = picked.providerVersion;
    }

    const draft = createReading({
      rules: rulesOf(lotto),
      refusalRate: config.refusalRate,
      weights: config.weights,
      library: library ?? bucketsFromLines(await activeLines()),
      touches,
      luckyInclusion: provider === ISOLATOR_PROVIDER.name ? false : config.luckyInclusion,
      timeZone: timeZone ?? undefined,
      mains,
      providerName,
      providerVersion,
    });
    if (draft.outcome === "numbers") {
      const problem = validateNumbers(rulesOf(lotto), draft.mainNumbers ?? [], draft.bonusNumbers ?? []);
      if (problem) {
        console.error("Reading failed validation.", problem);
        return {
          ok: false as const,
          message: SYSTEM_TRY_AGAIN,
          providerName: draft.providerName,
          providerVersion: draft.providerVersion,
        };
      }
    }
    return { ok: true as const, draft, delay: config.guestDelaySeconds };
  } catch (error) {
    console.error("Reading provider failed.", error);
    return {
      ok: false as const,
      message: SYSTEM_TRY_AGAIN,
      providerName: provider,
      providerVersion: provider === ISOLATOR_PROVIDER.name ? ISOLATOR_PROVIDER.version : RANDOM_PROVIDER.version,
    };
  }
}
