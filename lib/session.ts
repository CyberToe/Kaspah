import "server-only";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_GUEST, COOKIE_GUEST_BENCH, COOKIE_GUEST_COUNTRY, COOKIE_SESSION } from "./constants";
import { getDb } from "./db";
import type { Touches } from "./engine";
import { asTouches } from "./json";
import { profiles, users } from "./schema";

export type CurrentUser = {
  id: string;
  email: string;
  tokenVersion: number;
  passwordHash: string;
  profile: {
    displayName: string | null;
    countryCode: string | null;
    timezone: string | null;
    dateOfBirth: string | null;
    touches: Touches | null;
    disclaimerAcknowledgedAt: Date | null;
    onboardingCompletedAt: Date | null;
  } | null;
};

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-kaspah-local-secret-not-for-production");
  if (!secret) throw new Error("AUTH_SECRET is required in production.");
  return new TextEncoder().encode(secret);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function signSession(userId: string, tokenVersion: number) {
  return new SignJWT({ tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function setSession(userId: string, tokenVersion: number) {
  const jar = await cookies();
  jar.set(COOKIE_SESSION, await signSession(userId, tokenVersion), cookieOptions(60 * 60 * 24 * 30));
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_SESSION, "", cookieOptions(0));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSION)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.sub;
    const tokenVersion = Number(payload.tv);
    if (!userId || !Number.isInteger(tokenVersion)) return null;
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.tokenVersion !== tokenVersion) return null;
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return {
      id: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
      passwordHash: user.passwordHash,
      profile: profile
        ? {
            displayName: profile.displayName,
            countryCode: profile.countryCode,
            timezone: profile.timezone,
            dateOfBirth: profile.dateOfBirth,
            touches: asTouches(profile.personalTouches),
            disclaimerAcknowledgedAt: profile.disclaimerAcknowledgedAt,
            onboardingCompletedAt: profile.onboardingCompletedAt,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export function onboardingPath(user: CurrentUser): string | null {
  const profile = user.profile;
  if (!profile?.displayName || !profile.dateOfBirth || !profile.timezone) return "/onboarding/details";
  if (!profile.countryCode) return "/onboarding/country";
  if (!profile.onboardingCompletedAt) return "/onboarding/lottos";
  return null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function newSecret() {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashSecret(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function setGuestCookie(
  name: typeof COOKIE_GUEST | typeof COOKIE_GUEST_COUNTRY | typeof COOKIE_GUEST_BENCH,
  value: string,
) {
  const jar = await cookies();
  jar.set(name, value, cookieOptions(60 * 30));
}

export async function clearGuestCookies() {
  const jar = await cookies();
  jar.set(COOKIE_GUEST, "", cookieOptions(0));
  jar.set(COOKIE_GUEST_COUNTRY, "", cookieOptions(0));
  jar.set(COOKIE_GUEST_BENCH, "", cookieOptions(0));
}

export async function readCookie(name: string) {
  const jar = await cookies();
  return jar.get(name)?.value ?? null;
}
