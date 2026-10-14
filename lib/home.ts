import "server-only";

import { formatReadingDate, nextDrawLabel } from "./dates";
import type { PredictionRow } from "./data";
import type { ReadingDTO, RowDTO } from "./dto";
import { asNumberArray, asStringArray } from "./json";
import { lottosByIds, lottosForCountry, predictionsForUser, activeShares, selectionsFor, countryName } from "./data";

export function presentPrediction(row: PredictionRow, timeZone: string, shareToken: string | null): ReadingDTO {
  const drawDays = asStringArray(row.drawDays);
  const outcome = row.outcome === "refusal" ? "refusal" : "numbers";
  return {
    id: row.id,
    outcome,
    lottoName: row.lottoName,
    countryName: row.countryName,
    drawDays,
    mainNumbers: outcome === "numbers" ? asNumberArray(row.mainNumbers) : null,
    bonusNumbers: outcome === "numbers" ? asNumberArray(row.bonusNumbers) : null,
    confidenceLevel: outcome === "numbers" ? row.confidenceLevel : null,
    sentimentMessage: outcome === "numbers" ? row.sentimentMessage : null,
    personalNote: row.personalNote,
    refusalMessage: outcome === "refusal" ? row.refusalMessage : null,
    createdLabel: formatReadingDate(new Date(row.createdAt), timeZone),
    nextDraw: nextDrawLabel(drawDays, timeZone),
    shareToken: outcome === "numbers" ? shareToken : null,
  };
}

export async function loadRows(userId: string, countryCode: string, timeZone: string) {
  const available = await lottosForCountry(countryCode, true);
  const selections = await selectionsFor(userId);
  if (!selections.length && !available.length) return { kind: "unavailable" as const };
  if (!selections.length) return { kind: "need-selection" as const };

  const games = await lottosByIds(selections.map((row: { lottoId: string }) => row.lottoId));
  const byId = new Map(games.map((game) => [game.id, game]));
  const history = await predictionsForUser(userId);
  const shares = await activeShares(userId);
  const latest = new Map<string, PredictionRow>();
  for (const row of history) {
    if (!latest.has(row.lottoId)) latest.set(row.lottoId, row);
  }
  const place = await countryName(countryCode);
  const rows: RowDTO[] = [];
  for (const selection of selections as { lottoId: string }[]) {
    const lotto = byId.get(selection.lottoId);
    if (!lotto || lotto.countryCode !== countryCode) continue;
    const prediction = latest.get(lotto.id) ?? null;
    rows.push({
      lottoId: lotto.id,
      lottoName: lotto.name,
      countryName: place,
      drawDays: asStringArray(lotto.drawDays),
      isActive: lotto.isActive,
      reading: prediction ? presentPrediction(prediction, timeZone, shares.get(prediction.id) ?? null) : null,
    });
  }
  if (!rows.length && !available.length) return { kind: "unavailable" as const };
  if (!rows.length) return { kind: "need-selection" as const };
  return { kind: "rows" as const, rows };
}
