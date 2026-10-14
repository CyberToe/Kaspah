import { revokeReading, shareFromHistory } from "@/app/actions/reading";
import { CopyLink } from "@/components/fields";
import { SubmitButton } from "@/components/submit";
import { NumbersCard, RefusalCard } from "@/components/ui";
import { activeShares, predictionsForUser } from "@/lib/data";
import { presentPrediction } from "@/lib/home";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user?.profile?.timezone) redirect("/login");
  const step = onboardingPath(user);
  if (step) redirect(step);
  const rows = await predictionsForUser(user.id);
  const shares = await activeShares(user.id);
  const readings = rows.map((row) => presentPrediction(row, user.profile!.timezone!, shares.get(row.id) ?? null));
  return (
    <main id="content" className="wrap stack">
      <h1>My readings</h1>
      <p className="quiet">Newest first. Refusals stay in the record. Share links are only for readings that named numbers.</p>
      {readings.length === 0 ? <p className="kaspah">Kaspah has not read for you yet.</p> : null}
      <div className="rows">
        {readings.map((reading) => (
          <article key={reading.id} className="row-card">
            {reading.outcome === "numbers" && reading.mainNumbers && reading.confidenceLevel && reading.sentimentMessage ? (
              <NumbersCard
                lottoName={reading.lottoName}
                countryName={reading.countryName}
                mainNumbers={reading.mainNumbers}
                bonusNumbers={reading.bonusNumbers}
                confidenceLevel={reading.confidenceLevel}
                sentimentMessage={reading.sentimentMessage}
                personalNote={reading.personalNote}
                createdLabel={reading.createdLabel}
                nextDraw={reading.nextDraw}
              />
            ) : (
              <RefusalCard message={reading.refusalMessage || "The mist has not settled. Ask Kaspah again when you are ready."} />
            )}
            {reading.outcome === "refusal" ? <p className="quiet">{reading.createdLabel}</p> : null}
            {reading.outcome === "numbers" ? (
              <div className="stack">
                {reading.shareToken ? (
                  <>
                    <CopyLink token={reading.shareToken} />
                    <form action={revokeReading}>
                      <input type="hidden" name="token" value={reading.shareToken} />
                      <SubmitButton variant="ghost">Revoke link</SubmitButton>
                    </form>
                  </>
                ) : (
                  <form action={shareFromHistory}>
                    <p className="quiet">Anyone with this link can view this reading while it is active.</p>
                    <input type="hidden" name="predictionId" value={reading.id} />
                    <SubmitButton variant="ghost">Create share link</SubmitButton>
                  </form>
                )}
              </div>
            ) : (
              <p className="quiet">Refusals are not shared.</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
