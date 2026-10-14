import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { Touches } from "./engine";

const tz = { withTimezone: true, mode: "date" as const };

export const countries = pgTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  tokenVersion: integer("token_version").notNull().default(1),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", tz),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name"),
  countryCode: text("country_code"),
  timezone: text("timezone"),
  dateOfBirth: text("date_of_birth"),
  personalTouches: jsonb("personal_touches").$type<Touches | null>(),
  disclaimerAcknowledgedAt: timestamp("disclaimer_acknowledged_at", tz),
  onboardingCompletedAt: timestamp("onboarding_completed_at", tz),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
});

export const lottos = pgTable("lottos", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull(),
  jurisdictionNote: text("jurisdiction_note"),
  mainCount: integer("main_count").notNull(),
  mainMin: integer("main_min").notNull(),
  mainMax: integer("main_max").notNull(),
  bonusCount: integer("bonus_count").notNull(),
  bonusMin: integer("bonus_min"),
  bonusMax: integer("bonus_max"),
  bonusFromMainPool: boolean("bonus_from_main_pool").notNull(),
  drawDays: jsonb("draw_days").$type<string[]>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
});

export const userLottoSelections = pgTable(
  "user_lotto_selections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    lottoId: text("lotto_id").notNull(),
    selectedAt: timestamp("selected_at", tz).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_lotto_unique").on(table.userId, table.lottoId)],
);

export const predictionRequests = pgTable("prediction_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lottoId: text("lotto_id").notNull(),
  requestedAt: timestamp("requested_at", tz).notNull().defaultNow(),
  status: text("status").notNull(),
  providerName: text("provider_name").notNull(),
  providerVersion: text("provider_version").notNull(),
});

export const predictions = pgTable("predictions", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: text("user_id").notNull(),
  lottoId: text("lotto_id").notNull(),
  outcome: text("outcome").notNull(),
  mainNumbers: jsonb("main_numbers").$type<number[] | null>(),
  bonusNumbers: jsonb("bonus_numbers").$type<number[] | null>(),
  sentimentMessage: text("sentiment_message"),
  personalNote: text("personal_note"),
  confidenceLevel: integer("confidence_level"),
  refusalMessage: text("refusal_message"),
  lottoName: text("lotto_name").notNull(),
  countryName: text("country_name").notNull(),
  drawDays: jsonb("draw_days").$type<string[]>().notNull(),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const kaspahLines = pgTable("kaspah_lines", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  confidenceLevel: integer("confidence_level"),
  body: text("body").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const shareLinks = pgTable("share_links", {
  id: text("id").primaryKey(),
  predictionId: text("prediction_id").notNull(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", tz),
});

export const guestPredictionRequests = pgTable("guest_prediction_requests", {
  id: text("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  lottoId: text("lotto_id").notNull(),
  requestedAt: timestamp("requested_at", tz).notNull().defaultNow(),
  revealAt: timestamp("reveal_at", tz).notNull(),
  status: text("status").notNull(),
  outcome: text("outcome"),
  providerName: text("provider_name").notNull(),
  providerVersion: text("provider_version").notNull(),
  mainNumbers: jsonb("main_numbers").$type<number[] | null>(),
  bonusNumbers: jsonb("bonus_numbers").$type<number[] | null>(),
  sentimentMessage: text("sentiment_message"),
  confidenceLevel: integer("confidence_level"),
  refusalMessage: text("refusal_message"),
  lottoName: text("lotto_name").notNull(),
  countryName: text("country_name").notNull(),
  drawDays: jsonb("draw_days").$type<string[]>().notNull(),
  errorMessage: text("error_message"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", tz).notNull(),
  usedAt: timestamp("used_at", tz),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});
