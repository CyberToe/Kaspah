"use server";

import { redirect } from "next/navigation";
import { SYSTEM_TRY_AGAIN } from "@/lib/constants";
import {
  countryName,
  ensureShare,
  lottoById,
  revokeShare,
  saveFailedRequest,
  saveUserReading,
  selectionsFor,
} from "@/lib/data";
import type { AskResult, ReadingDTO } from "@/lib/dto";
import { asStringArray } from "@/lib/json";
import { performReading } from "@/lib/perform";
import { presentPrediction } from "@/lib/home";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { formatReadingDate, nextDrawLabel } from "@/lib/dates";

export async function askKaspah(lottoId: string): Promise<AskResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, message: "Please log in again." };
    if (onboardingPath(user) || !user.profile?.countryCode || !user.profile.timezone) {
      return { ok: false, message: "Finish your profile before asking for a reading." };
    }
    const lotto = await lottoById(lottoId);
    const selections = await selectionsFor(user.id);
    const saved = selections.some((row: { lottoId: string }) => row.lottoId === lottoId);
    if (!lotto || !lotto.isActive || lotto.countryCode !== user.profile.countryCode || !saved) {
      return { ok: false, message: "That lotto is not available for a reading." };
    }
    const result = await performReading(lotto, user.profile.touches, user.profile.timezone);
    if (!result.ok) {
      await saveFailedRequest({
        id: crypto.randomUUID(),
        userId: user.id,
        lottoId: lotto.id,
        providerName: result.providerName,
        providerVersion: result.providerVersion,
      });
      return { ok: false, message: result.message || SYSTEM_TRY_AGAIN };
    }
    const requestId = crypto.randomUUID();
    const predictionId = crypto.randomUUID();
    const place = await countryName(lotto.countryCode);
    const createdAt = await saveUserReading({
      requestId,
      predictionId,
      userId: user.id,
      lotto,
      countryName: place,
      draft: result.draft,
    });
    const drawDays = asStringArray(lotto.drawDays);
    const reading: ReadingDTO = {
      id: predictionId,
      outcome: result.draft.outcome,
      lottoName: lotto.name,
      countryName: place,
      drawDays,
      mainNumbers: result.draft.mainNumbers,
      bonusNumbers: result.draft.bonusNumbers,
      confidenceLevel: result.draft.confidenceLevel,
      sentimentMessage: result.draft.sentimentMessage,
      personalNote: result.draft.personalNote,
      refusalMessage: result.draft.refusalMessage,
      createdLabel: formatReadingDate(createdAt, user.profile.timezone),
      nextDraw: nextDrawLabel(drawDays, user.profile.timezone),
      shareToken: null,
    };
    return { ok: true, reading };
  } catch (error) {
    console.error("askKaspah failed.", error);
    return { ok: false, message: SYSTEM_TRY_AGAIN };
  }
}

export async function shareReading(predictionId: string): Promise<{ token?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const result = await ensureShare(user.id, predictionId);
  if ("error" in result) return { error: result.error };
  return { token: result.token };
}

export async function shareFromHistory(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await ensureShare(user.id, String(formData.get("predictionId") ?? ""));
  redirect("/history");
}

export async function revokeReading(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const token = String(formData.get("token") ?? "");
  if (token) await revokeShare(user.id, token);
  redirect("/history");
}

export async function loadOwnedReading(predictionId: string) {
  const user = await getCurrentUser();
  if (!user?.profile?.timezone) return null;
  const { predictionsForUser, activeShares } = await import("@/lib/data");
  const rows = await predictionsForUser(user.id);
  const row = rows.find((item) => item.id === predictionId);
  if (!row) return null;
  const shares = await activeShares(user.id);
  return presentPrediction(row, user.profile.timezone, shares.get(row.id) ?? null);
}
