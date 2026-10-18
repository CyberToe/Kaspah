import { eq } from "drizzle-orm";
import { DEFAULT_GUEST_DELAY, DEFAULT_REFUSAL_RATE, DEFAULT_WEIGHTS } from "./constants";
import { STARTER_LINES } from "./library";
import { appSettings, countries, kaspahLines, lottos } from "./schema";

const COUNTRY_SEED = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "DE", name: "Germany" },
];

const LOTTO_SEED = [
  lotto("ca-lotto-max", "Lotto Max", "CA", 7, 1, 50, 1, 1, 50, true, ["Tuesday", "Friday"]),
  lotto("ca-649", "Lotto 6/49", "CA", 6, 1, 49, 1, 1, 49, true, ["Wednesday", "Saturday"]),
  lotto("us-powerball", "Powerball", "US", 5, 1, 69, 1, 1, 26, false, ["Monday", "Wednesday", "Saturday"]),
  lotto("us-megamillions", "Mega Millions", "US", 5, 1, 70, 1, 1, 24, false, ["Tuesday", "Friday"]),
  lotto("gb-lotto", "UK National Lottery Lotto", "GB", 6, 1, 59, 1, 1, 59, true, ["Wednesday", "Saturday"]),
  lotto("ie-euromillions", "EuroMillions (Ireland entry)", "IE", 5, 1, 50, 2, 1, 12, false, ["Tuesday", "Friday"]),
  lotto("de-euromillions", "EuroMillions (Germany entry)", "DE", 5, 1, 50, 2, 1, 12, false, ["Tuesday", "Friday"]),
];

function lotto(
  id: string,
  name: string,
  countryCode: string,
  mainCount: number,
  mainMin: number,
  mainMax: number,
  bonusCount: number,
  bonusMin: number,
  bonusMax: number,
  bonusFromMainPool: boolean,
  drawDays: string[],
) {
  return {
    id,
    name,
    countryCode,
    jurisdictionNote: null,
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
  active_provider: "random",
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
    await db.insert(lottos).values(LOTTO_SEED);
  }

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
  // The brief isolator deploy left Neon on provider "isolator"; main only runs "random".
  await touchSetting(db, "active_provider", "random");
  await restoreDefaultCatalogue(db);
}

async function restoreDefaultCatalogue(db: { select: Function; insert: Function; update: Function }) {
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
}

export async function touchSetting(db: { update: Function }, key: string, value: string) {
  await db.update(appSettings).set({ value, updatedAt: new Date(), updatedBy: "app" }).where(eq(appSettings.key, key));
}
