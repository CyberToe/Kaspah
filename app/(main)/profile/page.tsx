import { ProfileForm } from "@/components/account-forms";
import { countryName, offeredCountries } from "@/lib/data";
import { timeZones } from "@/lib/forms";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  const step = onboardingPath(user);
  if (step) redirect(step);
  let countries = await offeredCountries();
  if (user.profile.countryCode && !countries.some((country: { code: string }) => country.code === user.profile?.countryCode)) {
    countries = [...countries, { code: user.profile.countryCode, name: await countryName(user.profile.countryCode) }];
  }
  return (
    <main id="content" className="narrow stack">
      <h1>My profile</h1>
      <p className="quiet">Signed in as {user.email}</p>
      <ProfileForm
        zones={timeZones()}
        countries={countries}
        displayName={user.profile.displayName || ""}
        dateOfBirth={user.profile.dateOfBirth || ""}
        timezone={user.profile.timezone || ""}
        countryCode={user.profile.countryCode || ""}
      />
      <p>
        <a href="/profile/lottos">Edit saved lottos</a>
      </p>
      <p>
        <a href="/profile/touches">Personal touches</a>
      </p>
      <p>
        <a href="/profile/delete">Delete account</a>
      </p>
    </main>
  );
}
