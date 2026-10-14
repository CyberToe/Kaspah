import { LottoForm } from "@/components/account-forms";
import { lottosByIds, lottosForCountry, selectionsFor } from "@/lib/data";
import { shortDays } from "@/lib/dates";
import { asStringArray } from "@/lib/json";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LottosPage() {
  const user = await getCurrentUser();
  if (!user?.profile?.countryCode) redirect("/login");
  const step = onboardingPath(user);
  if (step) redirect(step);
  const active = await lottosForCountry(user.profile.countryCode, true);
  const selectedRows = await selectionsFor(user.id);
  const selectedIds = selectedRows.map((row: { lottoId: string }) => row.lottoId);
  const known = await lottosByIds(selectedIds);
  const retired = known.filter((lotto) => lotto.countryCode === user.profile?.countryCode && !lotto.isActive);
  const options = [...active, ...retired].map((lotto) => ({
    id: lotto.id,
    name: lotto.name,
    active: lotto.isActive,
    detail: `Draws ${shortDays(asStringArray(lotto.drawDays))}`,
  }));
  return (
    <main id="content" className="narrow stack">
      <h1>Saved lottos</h1>
      <p className="quiet">Only games from your country can be saved. Retired games stay visible until you remove them, and they cannot be read again.</p>
      <LottoForm mode="profile" options={options} selected={selectedIds} />
      <p>
        <a href="/profile">Back to profile</a>
      </p>
    </main>
  );
}
