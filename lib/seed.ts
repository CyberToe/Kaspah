import { eq, notInArray } from "drizzle-orm";
import {
  DEFAULT_GUEST_DELAY,
  DEFAULT_ISOLATOR_TIER,
  DEFAULT_REFUSAL_RATE,
  DEFAULT_WEIGHTS,
  ISOLATOR_PROVIDER,
} from "./constants";
import { STARTER_LINES } from "./library";
import { appSettings, countries, kaspahLines, lottos } from "./schema";

const COUNTRY_SEED = [{ code: "CA", name: "Canada" }];

const LOTTO_SEED = [
  lotto("ca-lotto-max", "Lotto Max", "CA", 7, 1, 52, 0, null, null, false, ["Tuesday", "Friday"], null),
  lotto(
    "ca-quebec-max",
    "Quebec Max",
    "CA",
    7,
    1,
    52,
    0,
    null,
    null,
    false,
    ["Tuesday", "Friday"],
    "Quebec entry",
  ),
  lotto("ca-649", "Lotto 6/49", "CA", 6, 1, 49, 0, null, null, false, ["Wednesday", "Saturday"], null),
  lotto(
    "ca-quebec-49",
    "Quebec 49",
    "CA",
    6,
    1,
    49,
    0,
    null,
    null,
    false,
    ["Wednesday", "Saturday"],
    "Quebec entry",
  ),
];

const ACTIVE_LOTTO_IDS = LOTTO_SEED.map((row) => row.id);

function lotto(
  id: string,
  name: string,
  countryCode: string,
  mainCount: number,
  mainMin: number,
  mainMax: number,
  bonusCount: number,
  bonusMin: number | null,
  bonusMax: number | null,
  bonusFromMainPool: boolean,
  drawDays: string[],
  jurisdictionNote: string | null,
) {
  return {
    id,
    name,
    countryCode,
    jurisdictionNote,
    mainCount,
    mainMin,
    mainMax,
    bonusCount,
    bonusMin,
    bonusMax,
    bonusFromMainPool,
    drawDays,
    isActive: true,
  };
}

const SETTING_SEED: Record<string, string> = {
  refusal_rate: String(DEFAULT_REFUSAL_RATE),
  confidence_weights: JSON.stringify(DEFAULT_WEIGHTS),
  active_provider: ISOLATOR_PROVIDER.name,
  isolator_tier: DEFAULT_ISOLATOR_TIER,
  lucky_number_inclusion: "false",
  guest_delay: String(DEFAULT_GUEST_DELAY),
};

export async function seedIfEmpty(db: {
  select: Function;
  insert: Function;
  update: Function;
}) {
  const existingCountries = await db.select().from(countries);
  if (existingCountries.length === 0) {
    await db.insert(countries).values(COUNTRY_SEED);
  } else if (!existingCountries.some((row: { code: string }) => row.code === "CA")) {
    await db.insert(countries).values(COUNTRY_SEED);
  }

  await syncIsolatorCatalogue(db);

  const existingLines = await db.select().from(kaspahLines);
  if (existingLines.length === 0) {
    await db.insert(kaspahLines).values(
      STARTER_LINES.map((line) => ({
        id: line.id,
        kind: line.kind,
        confidenceLevel: line.confidenceLevel,
        body: line.body,
        isActive: true,
      })),
    );
  }

  const existingSettings = await db.select().from(appSettings);
  const keys = new Set(existingSettings.map((row: { key: string }) => row.key));
  const missing = Object.entries(SETTING_SEED)
    .filter(([key]) => !keys.has(key))
    .map(([key, value]) => ({ key, value, updatedBy: "seed" }));
  if (missing.length) await db.insert(appSettings).values(missing);
  await touchSetting(db, "active_provider", ISOLATOR_PROVIDER.name);
  await touchSetting(db, "isolator_tier", DEFAULT_ISOLATOR_TIER);
  await touchSetting(db, "lucky_number_inclusion", "false");
}

async function syncIsolatorCatalogue(db: { select: Function; insert: Function; update: Function }) {
  const existing = await db.select().from(lottos);
  const byId = new Map(existing.map((row: { id: string }) => [row.id, row]));
  for (const row of LOTTO_SEED) {
    if (byId.has(row.id)) {
      await db
        .update(lottos)
        .set({
          name: row.name,
          countryCode: row.countryCode,
          jurisdictionNote: row.jurisdictionNote,
          mainCount: row.mainCount,
          mainMin: row.mainMin,
          mainMax: row.mainMax,
          bonusCount: row.bonusCount,
          bonusMin: row.bonusMin,
          bonusMax: row.bonusMax,
          bonusFromMainPool: row.bonusFromMainPool,
          drawDays: row.drawDays,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(lottos.id, row.id));
    } else {
      await db.insert(lottos).values(row);
    }
  }
  if (existing.length) {
    await db
      .update(lottos)
      .set({ isActive: false, updatedAt: new Date() })
      .where(notInArray(lottos.id, ACTIVE_LOTTO_IDS));
  }
}

export async function touchSetting(db: { update: Function }, key: string, value: string) {
  await db.update(appSettings).set({ value, updatedAt: new Date(), updatedBy: "app" }).where(eq(appSettings.key, key));
}
