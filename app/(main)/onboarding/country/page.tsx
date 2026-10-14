import { chooseCountry } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit";
import { offeredCountries } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function CountryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.onboardingCompletedAt) redirect("/profile");
  if (!user.profile?.displayName || !user.profile.dateOfBirth || !user.profile.timezone) redirect("/onboarding/details");
  const countries = await offeredCountries();
  const error = (await searchParams).error;
  return (
    <main id="content" className="narrow stack">
      <p className="eyebrow">Step 2 of 3</p>
      <h1>Where are you from?</h1>
      <p className="kaspah">Name the country, and only then will the games of that land appear. No other country’s lottos will be shown.</p>
      {error ? <p className="form-error">Choose a country from the list.</p> : null}
      <form action={chooseCountry} className="stack auth-card">
        <label>
          Country
          <select name="country" required defaultValue={user.profile.countryCode ?? ""}>
            <option value="" disabled>
              Choose a country
            </option>
            {countries.map((country: { code: string; name: string }) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton>Continue</SubmitButton>
      </form>
    </main>
  );
}
