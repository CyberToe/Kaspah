"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_GUEST, COOKIE_GUEST_COUNTRY } from "@/lib/constants";
import { countryName, insertGuest, lottoById, offeredCountries, settingsRows } from "@/lib/data";
import { performReading } from "@/lib/perform";
import { guestAllowed } from "@/lib/rate";
import { parseSettings } from "@/lib/settings";
import { clearGuestCookies, getCurrentUser, readCookie, setGuestCookie } from "@/lib/session";

export async function setGuestCountry(formData: FormData) {
  if (await getCurrentUser()) redirect("/readings");
  const country = String(formData.get("country") ?? "");
  const offered = await offeredCountries();
  if (!offered.some((row: { code: string }) => row.code === country)) {
    redirect("/guest?notice=country");
  }
  await setGuestCookie(COOKIE_GUEST_COUNTRY, country);
  redirect("/guest");
}

export async function clearGuestCountry() {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set(COOKIE_GUEST_COUNTRY, "", { path: "/", maxAge: 0 });
  redirect("/guest");
}

export async function startGuestReading(formData: FormData) {
  if (await getCurrentUser()) redirect("/readings");
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!guestAllowed(ip)) redirect("/guest?notice=quiet");
  const country = await readCookie(COOKIE_GUEST_COUNTRY);
  const lottoId = String(formData.get("lotto") ?? "");
  const offered = await offeredCountries();
  if (!country || !offered.some((row: { code: string }) => row.code === country)) {
    redirect("/guest");
  }
  const lotto = await lottoById(lottoId);
  if (!lotto || !lotto.isActive || lotto.countryCode !== country) {
    redirect("/guest?notice=lotto");
  }
  const result = await performReading(lotto, null, null);
  const config = parseSettings(await settingsRows());
  const id = crypto.randomUUID();
  const place = await countryName(country);
  await insertGuest({
    id,
    countryCode: country,
    lotto,
    countryName: place,
    revealAt: new Date(Date.now() + config.guestDelaySeconds * 1000),
    draft: result.ok ? result.draft : null,
    errorMessage: result.ok ? undefined : result.message,
  });
  await setGuestCookie(COOKIE_GUEST, id);
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set(COOKIE_GUEST_COUNTRY, "", { path: "/", maxAge: 0 });
  redirect("/guest");
}

export async function abandonGuest() {
  await clearGuestCookies();
  redirect("/guest");
}
