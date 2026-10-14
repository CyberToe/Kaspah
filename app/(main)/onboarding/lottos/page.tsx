import { LottoForm } from "@/components/account-forms";
import { lottosForCountry, selectionsFor } from "@/lib/data";
import { asStringArray } from "@/lib/json";
import { shortDays } from "@/lib/dates";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function OnboardingLottosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.onboardingCompletedAt) redirect("/readings");
  if (!user.profile?.countryCode) redirect("/onboarding/country");
  const games = await lottosForCountry(user.profile.countryCode, true);
  const selected = await selectionsFor(user.id);
  return (
    <main id="content" className="narrow stack">
      <p className="eyebrow">Step 3 of 3</p>
      <h1>Which games do you play?</h1>
      <p className="kaspah">Choose at least one. I will keep a row for each, and I will not look at a game from anywhere else.</p>
      <LottoForm
        mode="onboarding"
        selected={selected.map((row: { lottoId: string }) => row.lottoId)}
        options={games.map((game) => ({
          id: game.id,
          name: game.name,
          active: true,
          detail: `Draws ${shortDays(asStringArray(game.drawDays))}`,
        }))}
      />
    </main>
  );
}
