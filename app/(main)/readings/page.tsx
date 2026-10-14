import { ReadingRows } from "@/components/rows";
import { Disclaimer } from "@/components/ui";
import { loadRows } from "@/lib/home";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ReadingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const step = onboardingPath(user);
  if (step) redirect(step);
  const home = await loadRows(user.id, user.profile!.countryCode!, user.profile!.timezone!);
  if (home.kind === "need-selection") redirect("/profile/lottos");
  return (
    <main id="content" className="wrap stack">
      <div className="chamber">
        <figure className="presence">
          <img
            src="/kaspah.jpeg"
            width={1325}
            height={1600}
            alt="The Great Kaspah, in a gold turban and burgundy robe, beside his crystal ball."
          />
        </figure>
        <div>
          <p className="eyebrow">The inner chamber</p>
          <h1>Ask Kaspah</h1>
          <p className="kaspah">Ah, {user.profile?.displayName}. The glass knows you. Each game has its own row. Ask one, and the others stay as they were.</p>
        </div>
      </div>
      <Disclaimer />
      {home.kind === "unavailable" ? (
        <p className="system-card">
          Readings are not available yet for your country. Your profile is saved. When a lotto is offered where you are from, it will appear here. You will not be shown another country’s games.
        </p>
      ) : (
        <ReadingRows rows={home.rows} />
      )}
    </main>
  );
}
