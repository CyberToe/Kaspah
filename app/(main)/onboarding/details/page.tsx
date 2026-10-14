import { DetailsForm } from "@/components/account-forms";
import { timeZones } from "@/lib/forms";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DetailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.onboardingCompletedAt) redirect("/profile");
  if (onboardingPath(user) === "/onboarding/lottos") redirect("/onboarding/lottos");
  return (
    <main id="content" className="narrow stack">
      <p className="eyebrow">Step 1 of 3</p>
      <h1>Who approaches?</h1>
      <p className="kaspah">A name for the glass, the day you were born, and the clock you live by.</p>
      <DetailsForm
        zones={timeZones()}
        displayName={user.profile?.displayName}
        dateOfBirth={user.profile?.dateOfBirth}
        timezone={user.profile?.timezone}
      />
    </main>
  );
}
