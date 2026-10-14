"use server";

import { redirect } from "next/navigation";
import {
  completeOnboarding,
  countryName,
  lottoById,
  lottosForCountry,
  offeredCountries,
  saveCountry,
  saveProfileDetails,
  saveTouches,
  selectionsFor,
  syncSelections,
} from "@/lib/data";
import { cleanName, parseDob, parseTouches, parseZone, type FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/session";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function saveDetails(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const displayName = cleanName(formData.get("displayName"));
  const dateOfBirth = parseDob(formData.get("dateOfBirth"));
  const timezone = parseZone(formData.get("timezone"));
  if (!displayName) return { error: "Enter a display name, up to 40 characters." };
  if (!dateOfBirth) return { error: "Enter your date of birth." };
  if (!timezone) return { error: "Choose a timezone." };
  await saveProfileDetails({ userId: user.id, displayName, dateOfBirth, timezone });
  redirect("/onboarding/country");
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const displayName = cleanName(formData.get("displayName"));
  const dateOfBirth = parseDob(formData.get("dateOfBirth"));
  const timezone = parseZone(formData.get("timezone"));
  const countryCode = String(formData.get("country") ?? "");
  if (!displayName) return { error: "Enter a display name, up to 40 characters." };
  if (!dateOfBirth) return { error: "Enter your date of birth." };
  if (!timezone) return { error: "Choose a timezone." };
  const offered = await offeredCountries();
  const allowed = new Set(offered.map((country: { code: string }) => country.code));
  if (user.profile?.countryCode) allowed.add(user.profile.countryCode);
  if (!allowed.has(countryCode)) return { error: "Choose a country from the list." };
  await saveProfileDetails({ userId: user.id, displayName, dateOfBirth, timezone });
  if (countryCode !== user.profile?.countryCode) {
    if (formData.get("confirmCountry") !== "yes") {
      return {
        warning:
          "Changing your country will remove every lotto saved on your profile. Your past readings stay as they are, with the lotto names they had at the time. You will need to choose lottos for the new country before the next reading. Nothing about your country changes until you confirm.",
        pendingCountry: countryCode,
      };
    }
    await saveCountry(user.id, countryCode);
    redirect("/profile/lottos");
  }
  return { saved: true };
}

export async function confirmCountry(formData: FormData) {
  const user = await requireUser();
  const countryCode = String(formData.get("country") ?? "");
  const offered = await offeredCountries();
  if (!offered.some((country: { code: string }) => country.code === countryCode)) {
    redirect("/profile");
  }
  if (countryCode !== user.profile?.countryCode) await saveCountry(user.id, countryCode);
  redirect("/profile/lottos");
}

export async function chooseCountry(formData: FormData) {
  const user = await requireUser();
  const countryCode = String(formData.get("country") ?? "");
  const offered = await offeredCountries();
  if (!offered.some((country: { code: string }) => country.code === countryCode)) {
    redirect("/onboarding/country?error=1");
  }
  if (countryCode !== user.profile?.countryCode) await saveCountry(user.id, countryCode);
  redirect("/onboarding/lottos");
}

export async function saveOnboardingLottos(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!user.profile?.countryCode) redirect("/onboarding/country");
  if (formData.get("ack") !== "yes") {
    return { error: "Please acknowledge the entertainment notice before continuing." };
  }
  const available = await lottosForCountry(user.profile.countryCode, true);
  const chosen = await allowedChoices(user.id, user.profile.countryCode, formData);
  if (available.length && !chosen.some((id) => available.some((lotto) => lotto.id === id))) {
    return { error: "Select at least one lotto." };
  }
  await syncSelections(user.id, chosen);
  await completeOnboarding(user.id);
  redirect("/readings");
}

export async function saveLottoChoices(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!user.profile?.countryCode) redirect("/onboarding/country");
  const available = await lottosForCountry(user.profile.countryCode, true);
  const chosen = await allowedChoices(user.id, user.profile.countryCode, formData);
  const activeChosen = chosen.filter((id) => available.some((lotto) => lotto.id === id));
  if (available.length && activeChosen.length === 0) {
    return { error: "Select at least one lotto that is still offered in your country." };
  }
  await syncSelections(user.id, chosen);
  return { saved: true };
}

async function allowedChoices(userId: string, countryCode: string, formData: FormData) {
  const submitted = formData.getAll("lotto").map(String);
  const available = await lottosForCountry(countryCode, true);
  const existing = await selectionsFor(userId);
  const active = new Set(available.map((lotto) => lotto.id));
  const already = new Set(existing.map((row: { lottoId: string }) => row.lottoId));
  const chosen: string[] = [];
  for (const id of submitted) {
    const lotto = await lottoById(id);
    if (!lotto || lotto.countryCode !== countryCode) continue;
    if (active.has(id) || already.has(id)) chosen.push(id);
  }
  return [...new Set(chosen)];
}

export async function savePersonalTouches(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseTouches(formData);
  if (!parsed.ok) return { error: parsed.error };
  await saveTouches(user.id, parsed.touches);
  return { saved: true };
}

export async function countryLabel(code: string) {
  return countryName(code);
}
