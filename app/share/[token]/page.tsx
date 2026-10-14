import { Disclaimer, NumbersCard } from "@/components/ui";
import { SHARE_CTA } from "@/lib/constants";
import { formatReadingDate } from "@/lib/dates";
import { publicReading } from "@/lib/data";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const reading = await publicReading(token);
  if (!reading || !reading.mainNumbers || !reading.confidenceLevel || !reading.sentimentMessage) {
    return (
      <main id="content" className="narrow">
        <h1>This reading is no longer available</h1>
        <p>
          <a href="/">Return to the entrance</a>
        </p>
      </main>
    );
  }
  return (
    <main id="content" className="narrow stack">
      <p className="quiet">The Great Kaspah provided these numbers.</p>
      <NumbersCard
        lottoName={reading.lottoName}
        countryName={reading.countryName}
        mainNumbers={reading.mainNumbers}
        bonusNumbers={reading.bonusNumbers}
        confidenceLevel={reading.confidenceLevel}
        sentimentMessage={reading.sentimentMessage}
        createdLabel={`${formatReadingDate(new Date(reading.createdAt), "UTC")} UTC`}
        provided={false}
      />
      <Disclaimer />
      <p className="kaspah">{SHARE_CTA}</p>
      <div className="actions">
        <a className="btn gold" href="/register">
          Create an account
        </a>
        <a className="btn ghost" href="/login">
          Log in
        </a>
      </div>
    </main>
  );
}
