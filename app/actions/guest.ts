"use server";

import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { COOKIE_GUEST, COOKIE_GUEST_BENCH, COOKIE_GUEST_COUNTRY } from "@/lib/constants";
import { countryName, insertGuest, lottoById, offeredCountries, settingsRows } from "@/lib/data";
import { labLibrary } from "@/lib/lab";
import { performReading } from "@/lib/perform";
import { guestAllowed } from "@/lib/rate";
import { parseSettings } from "@/lib/settings";
import { clearGuestCookies, getCurrentUser, readCookie, setGuestCookie } from "@/lib/session";

function guestPath(formData: FormData | undefined, notice?: string) {
  const base = formData?.get("bench") === "lab" ? "/lab/guest" : "/guest";
  return notice ? `${base}?notice=${notice}` : base;
}

export async function setGuestCountry(formData: FormData) {
  if (await getCurrentUser()) redirect("/readings");
  const country = String(formData.get("country") ?? "");
  const offered = await offeredCountries();
  if (!offered.some((row: { code: string }) => row.code === country)) {
    redirect(guestPath(formData, "country"));
  }
  await setGuestCookie(COOKIE_GUEST_COUNTRY, country);
  redirect(guestPath(formData));
}

export async function clearGuestCountry(formData: FormData) {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set(COOKIE_GUEST_COUNTRY, "", { path: "/", maxAge: 0 });
  redirect(guestPath(formData));
}

export async function startGuestReading(formData: FormData) {
  try {
    if (await getCurrentUser()) redirect("/readings");
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!guestAllowed(ip)) redirect(guestPath(formData, "quiet"));
    const country = await readCookie(COOKIE_GUEST_COUNTRY);
    const lottoId = String(formData.get("lotto") ?? "");
    const offered = await offeredCountries();
    if (!country || !offered.some((row: { code: string }) => row.code === country)) {
      redirect(guestPath(formData));
    }
    const lotto = await lottoById(lottoId);
    if (!lotto || !lotto.isActive || lotto.countryCode !== country) {
      redirect(guestPath(formData, "lotto"));
    }
    const lab = formData.get("bench") === "lab";
    const result = await performReading(lotto, null, null, lab ? labLibrary() : undefined);
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
    if (formData.get("bench") === "lab") {
      await setGuestCookie(COOKIE_GUEST_BENCH, "lab");
    } else {
      jar.set(COOKIE_GUEST_BENCH, "", { path: "/", maxAge: 0 });
    }
    redirect(guestPath(formData));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("startGuestReading failed.", error);
    redirect(guestPath(formData, "quiet"));
  }
}

export async function abandonGuest(formData: FormData) {
  await clearGuestCookies();
  redirect(guestPath(formData));
}
