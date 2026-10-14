import "server-only";

import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import type { ReadingDraft } from "./engine";
import { asNumberArray, asStringArray } from "./json";
import {
  appSettings,
  countries,
  guestPredictionRequests,
  kaspahLines,
  lottos,
  passwordResetTokens,
  predictionRequests,
  predictions,
  profiles,
  shareLinks,
  userLottoSelections,
  users,
} from "./schema";

async function db(): Promise<any> {
  return getDb();
}

export type LottoRow = typeof lottos.$inferSelect;
export type PredictionRow = typeof predictions.$inferSelect;

export async function findUserByEmail(email: string) {
  const [user] = await (await db()).select().from(users).where(eq(users.email, email));
  return user ?? null;
}

export async function findUserById(id: string) {
  const [user] = await (await db()).select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function createAccount(input: { id: string; email: string; passwordHash: string }) {
  const now = new Date();
  const database = await db();
  await database.transaction(async (tx: any) => {
    await tx.insert(users).values({
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      tokenVersion: 1,
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(profiles).values({ userId: input.id, createdAt: now, updatedAt: now });
  });
}

export async function markLogin(userId: string) {
  await (await db()).update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function changePassword(userId: string, passwordHash: string, tokenVersion: number) {
  await (await db())
    .update(users)
    .set({ passwordHash, tokenVersion, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function removeUser(userId: string) {
  await (await db()).delete(users).where(eq(users.id, userId));
}

export async function saveResetToken(input: { id: string; userId: string; tokenHash: string; expiresAt: Date }) {
  const database = await db();
  await database.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.userId));
  await database.insert(passwordResetTokens).values(input);
}

export async function findResetToken(tokenHash: string) {
  const [row] = await (await db())
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash));
  return row ?? null;
}

export async function markResetUsed(id: string) {
  await (await db()).update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
}

export async function saveProfileDetails(input: {
  userId: string;
  displayName: string;
  dateOfBirth: string;
  timezone: string;
}) {
  await (await db())
    .update(profiles)
    .set({
      displayName: input.displayName,
      dateOfBirth: input.dateOfBirth,
      timezone: input.timezone,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, input.userId));
}

export async function saveCountry(userId: string, countryCode: string) {
  const database = await db();
  await database.transaction(async (tx: any) => {
    await tx.update(profiles).set({ countryCode, updatedAt: new Date() }).where(eq(profiles.userId, userId));
    await tx.delete(userLottoSelections).where(eq(userLottoSelections.userId, userId));
  });
}

export async function offeredCountries() {
  const database = await db();
  const all = await database.select().from(countries).where(eq(countries.isActive, true));
  const games = await database.select().from(lottos).where(eq(lottos.isActive, true));
  const codes = new Set(games.map((game: LottoRow) => game.countryCode));
  return all
    .filter((country: { code: string; name: string; isActive: boolean }) => codes.has(country.code))
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
}

export async function countryName(code: string) {
  const [row] = await (await db()).select().from(countries).where(eq(countries.code, code));
  return row?.name ?? code;
}

export async function lottosForCountry(countryCode: string, activeOnly = true) {
  const rows = await (await db()).select().from(lottos).where(eq(lottos.countryCode, countryCode));
  return (rows as LottoRow[])
    .filter((row) => (activeOnly ? row.isActive : true))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function lottoById(id: string) {
  const [row] = await (await db()).select().from(lottos).where(eq(lottos.id, id));
  return (row as LottoRow | undefined) ?? null;
}

export async function selectionsFor(userId: string) {
  return (await db())
    .select()
    .from(userLottoSelections)
    .where(eq(userLottoSelections.userId, userId))
    .orderBy(asc(userLottoSelections.selectedAt));
}

export async function syncSelections(userId: string, lottoIds: string[]) {
  const database = await db();
  const existing = await database
    .select()
    .from(userLottoSelections)
    .where(eq(userLottoSelections.userId, userId));
  const have = new Set(existing.map((row: { lottoId: string }) => row.lottoId));
  const want = new Set(lottoIds);
  for (const lottoId of lottoIds) {
    if (have.has(lottoId)) continue;
    await database.insert(userLottoSelections).values({
      id: crypto.randomUUID(),
      userId,
      lottoId,
      selectedAt: new Date(),
    });
  }
  for (const row of existing as { id: string; lottoId: string }[]) {
    if (!want.has(row.lottoId)) {
      await database.delete(userLottoSelections).where(eq(userLottoSelections.id, row.id));
    }
  }
}

export async function completeOnboarding(userId: string) {
  const now = new Date();
  await (await db())
    .update(profiles)
    .set({
      disclaimerAcknowledgedAt: now,
      onboardingCompletedAt: now,
      updatedAt: now,
    })
    .where(eq(profiles.userId, userId));
}

export async function saveTouches(userId: string, touches: unknown) {
  await (await db())
    .update(profiles)
    .set({ personalTouches: touches, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));
}

export async function settingsRows() {
  return (await db()).select().from(appSettings);
}

export async function activeLines() {
  const rows = await (await db()).select().from(kaspahLines).where(eq(kaspahLines.isActive, true));
  return rows as { kind: string; confidenceLevel: number | null; body: string }[];
}

export async function linesByKind(kind: string) {
  const rows = await (await db())
    .select()
    .from(kaspahLines)
    .where(and(eq(kaspahLines.kind, kind), eq(kaspahLines.isActive, true)));
  return (rows as { body: string }[]).map((row) => row.body);
}

export async function saveUserReading(input: {
  requestId: string;
  predictionId: string;
  userId: string;
  lotto: LottoRow;
  countryName: string;
  draft: ReadingDraft;
}) {
  const now = new Date();
  const status = input.draft.outcome === "numbers" ? "completed" : "refusal";
  const database = await db();
  await database.transaction(async (tx: any) => {
    await tx.insert(predictionRequests).values({
      id: input.requestId,
      userId: input.userId,
      lottoId: input.lotto.id,
      requestedAt: now,
      status,
      providerName: input.draft.providerName,
      providerVersion: input.draft.providerVersion,
    });
    await tx.insert(predictions).values({
      id: input.predictionId,
      requestId: input.requestId,
      userId: input.userId,
      lottoId: input.lotto.id,
      outcome: input.draft.outcome,
      mainNumbers: input.draft.mainNumbers,
      bonusNumbers: input.draft.bonusNumbers,
      sentimentMessage: input.draft.sentimentMessage,
      personalNote: input.draft.personalNote,
      confidenceLevel: input.draft.confidenceLevel,
      refusalMessage: input.draft.refusalMessage,
      lottoName: input.lotto.name,
      countryName: input.countryName,
      drawDays: asStringArray(input.lotto.drawDays),
      createdAt: now,
    });
  });
  return now;
}

export async function saveFailedRequest(input: { id: string; userId: string; lottoId: string; providerName: string; providerVersion: string }) {
  await (await db()).insert(predictionRequests).values({
    id: input.id,
    userId: input.userId,
    lottoId: input.lottoId,
    requestedAt: new Date(),
    status: "error",
    providerName: input.providerName,
    providerVersion: input.providerVersion,
  });
}

export async function predictionsForUser(userId: string) {
  const rows = await (await db())
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId))
    .orderBy(desc(predictions.createdAt));
  return rows as PredictionRow[];
}

export async function activeShares(userId: string) {
  const rows = await (await db())
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.userId, userId), eq(shareLinks.isRevoked, false)));
  const map = new Map<string, string>();
  for (const row of rows as { predictionId: string; token: string; createdAt: Date }[]) {
    map.set(row.predictionId, row.token);
  }
  return map;
}

export async function ensureShare(userId: string, predictionId: string) {
  const database = await db();
  const [prediction] = await database
    .select()
    .from(predictions)
    .where(and(eq(predictions.id, predictionId), eq(predictions.userId, userId)));
  if (!prediction || prediction.outcome !== "numbers") return { error: "Only a completed numbers reading can be shared." };
  const [existing] = await database
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.predictionId, predictionId), eq(shareLinks.userId, userId), eq(shareLinks.isRevoked, false)));
  if (existing) return { token: existing.token as string };
  const token = randomBytes(32).toString("base64url");
  await database.insert(shareLinks).values({
    id: crypto.randomUUID(),
    predictionId,
    userId,
    token,
    isRevoked: false,
  });
  return { token };
}

export async function revokeShare(userId: string, token: string) {
  await (await db())
    .update(shareLinks)
    .set({ isRevoked: true, revokedAt: new Date() })
    .where(and(eq(shareLinks.userId, userId), eq(shareLinks.token, token), eq(shareLinks.isRevoked, false)));
}

export async function publicReading(token: string) {
  const [row] = await (await db())
    .select({
      isRevoked: shareLinks.isRevoked,
      outcome: predictions.outcome,
      mainNumbers: predictions.mainNumbers,
      bonusNumbers: predictions.bonusNumbers,
      sentimentMessage: predictions.sentimentMessage,
      confidenceLevel: predictions.confidenceLevel,
      lottoName: predictions.lottoName,
      countryName: predictions.countryName,
      createdAt: predictions.createdAt,
    })
    .from(shareLinks)
    .innerJoin(predictions, eq(shareLinks.predictionId, predictions.id))
    .where(eq(shareLinks.token, token));
  if (!row || row.isRevoked || row.outcome !== "numbers") return null;
  return {
    lottoName: row.lottoName as string,
    countryName: row.countryName as string,
    mainNumbers: asNumberArray(row.mainNumbers),
    bonusNumbers: asNumberArray(row.bonusNumbers),
    sentimentMessage: row.sentimentMessage as string,
    confidenceLevel: row.confidenceLevel as number,
    createdAt: row.createdAt as Date,
  };
}

export async function insertGuest(input: {
  id: string;
  countryCode: string;
  lotto: LottoRow;
  countryName: string;
  revealAt: Date;
  draft: ReadingDraft | null;
  errorMessage?: string;
}) {
  const failed = !input.draft;
  await (await db()).insert(guestPredictionRequests).values({
    id: input.id,
    countryCode: input.countryCode,
    lottoId: input.lotto.id,
    requestedAt: new Date(),
    revealAt: input.revealAt,
    status: failed ? "error" : input.draft!.outcome === "numbers" ? "completed" : "refusal",
    outcome: input.draft?.outcome ?? null,
    providerName: input.draft?.providerName ?? "random",
    providerVersion: input.draft?.providerVersion ?? "1.0.0",
    mainNumbers: input.draft?.mainNumbers ?? null,
    bonusNumbers: input.draft?.bonusNumbers ?? null,
    sentimentMessage: input.draft?.sentimentMessage ?? null,
    confidenceLevel: input.draft?.confidenceLevel ?? null,
    refusalMessage: input.draft?.refusalMessage ?? null,
    lottoName: input.lotto.name,
    countryName: input.countryName,
    drawDays: asStringArray(input.lotto.drawDays),
    errorMessage: input.errorMessage ?? null,
  });
}

export async function findGuest(id: string) {
  const [row] = await (await db()).select().from(guestPredictionRequests).where(eq(guestPredictionRequests.id, id));
  return row ?? null;
}

export async function lottosByIds(ids: string[]) {
  if (!ids.length) return [] as LottoRow[];
  const rows = await (await db()).select().from(lottos).where(inArray(lottos.id, ids));
  return rows as LottoRow[];
}
