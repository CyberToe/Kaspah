import { abandonGuest, clearGuestCountry, setGuestCountry, startGuestReading } from "@/app/actions/guest";
import { GuestAsking, MistLines } from "@/components/mist";
import { SubmitButton } from "@/components/submit";
import { Disclaimer, NumbersCard, RefusalCard } from "@/components/ui";
import { COOKIE_GUEST, COOKIE_GUEST_BENCH, COOKIE_GUEST_COUNTRY, COUNTRY_TIMEZONES, SYSTEM_TRY_AGAIN } from "@/lib/constants";
import { formatReadingDate, nextDrawLabel } from "@/lib/dates";
import { findGuest, lottosForCountry, offeredCountries } from "@/lib/data";
import { asNumberArray, asStringArray } from "@/lib/json";
import { LAB_AFTER, LAB_DISCLAIMER, LAB_FEELING, LAB_PITCH, LAB_PROGRESS, LAB_RESPONSIBLE, labPhrase } from "@/lib/lab";
import { getCurrentUser, readCookie } from "@/lib/session";
import { redirect } from "next/navigation";

function stablePick(items: string[], key: string) {
  if (!items.length) return "";
  let hash = 0;
  for (const char of key) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return items[hash % items.length] ?? items[0]!;
}

function Bench() {
  return <input type="hidden" name="bench" value="lab" />;
}

export default async function LabGuestPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  if (await getCurrentUser()) redirect("/readings");
  const notice = (await searchParams).notice;
  const guestId = await readCookie(COOKIE_GUEST);
  const bench = await readCookie(COOKIE_GUEST_BENCH);
  if (guestId && bench === "lab") {
    const row = await findGuest(guestId);
    if (row) return <LabChamber row={row} />;
  }

  const country = await readCookie(COOKIE_GUEST_COUNTRY);
  const countries = (await offeredCountries()) as { code: string; name: string }[];
  if (!country) {
    return (
      <main id="content" className="narrow stack">
        <div className="chamber">
          <figure className="presence">
            <img src="/lottolab.jpg" alt="" width={689} height={947} />
          </figure>
          <div>
            <p className="voice">LottoLab</p>
            <p>No account is required for a single trial. State the country of the draw, and the bench will list only the games from that country.</p>
          </div>
        </div>
        <p>Where is the draw held? The protocol does not mix countries.</p>
        {notice === "quiet" ? <p className="system-card">The sample needs a moment. Please try again shortly.</p> : null}
        {notice === "country" ? <p className="form-error">Choose a country from the list.</p> : null}
        <form action={setGuestCountry} className="stack auth-card">
          <Bench />
          <label>
            Country
            <select name="country" required defaultValue="">
              <option value="" disabled>
                Choose a country
              </option>
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Record country</SubmitButton>
        </form>
        <Disclaimer lead={LAB_DISCLAIMER} responsible={LAB_RESPONSIBLE} />
      </main>
    );
  }

  const games = await lottosForCountry(country, true);
  const place = countries.find((item) => item.code === country)?.name ?? country;
  if (!games.length) {
    return (
      <main id="content" className="narrow stack">
        <p>No active lotto is on file for that country. Choose another country and the bench will list what it can run.</p>
        <form action={clearGuestCountry}>
          <Bench />
          <SubmitButton variant="ghost">Choose another country</SubmitButton>
        </form>
      </main>
    );
  }

  return (
    <main id="content" className="narrow stack">
      <div className="chamber">
        <figure className="presence">
          <img src="/lottolab.jpg" alt="" width={689} height={947} />
        </figure>
        <div>
          <p className="voice">LottoLab</p>
          <p>Which lotto in {place} is under observation? One game only, for a guest trial.</p>
        </div>
      </div>
      {notice === "lotto" ? <p className="form-error">Choose one of the lottos offered for that country.</p> : null}
      <form action={startGuestReading} className="stack">
        <Bench />
        <GuestAsking portrait="/lottolab.jpg" title="A trial is in progress" detail="Mixing the solution. Stay on this page." />
        <div className="lotto-list">
          {games.map((game) => (
            <label key={game.id} className="lotto-option">
              <input type="radio" name="lotto" value={game.id} required />
              <span>
                <strong>{game.name}</strong>
                <small>Draws {asStringArray(game.drawDays).join(", ")}</small>
              </span>
            </label>
          ))}
        </div>
        <SubmitButton>Start the trial</SubmitButton>
      </form>
      <form action={clearGuestCountry}>
        <Bench />
        <button className="text-btn" type="submit">
          Choose a different country
        </button>
      </form>
    </main>
  );
}

async function LabChamber({
  row,
}: {
  row: {
    id: string;
    revealAt: Date | string;
    status: string;
    outcome: string | null;
    countryCode: string;
    lottoName: string;
    countryName: string;
    mainNumbers: unknown;
    bonusNumbers: unknown;
    sentimentMessage: string | null;
    confidenceLevel: number | null;
    refusalMessage: string | null;
    drawDays: unknown;
    requestedAt: Date | string;
  };
}) {
  const remaining = new Date(row.revealAt).getTime() - Date.now();
  const pitch = stablePick(LAB_PITCH, row.id);
  if (remaining > 0) {
    return (
      <main id="content" className="stack">
        <meta httpEquiv="refresh" content={String(Math.max(2, Math.ceil(remaining / 1000)))} />
        <MistLines
          lines={LAB_PROGRESS}
          pitch={pitch}
          lottoName={row.lottoName}
          requestedAt={new Date(row.requestedAt).toISOString()}
          revealAt={new Date(row.revealAt).toISOString()}
          portrait="/lottolab.jpg"
          waitingTitle="A trial is in progress"
          readyTitle="The sample is ready"
          waitingDetail={`${row.lottoName}. Mixing the solution. Stay on this page.`}
          readyDetail={`${row.lottoName}. The page will show the result in a moment.`}
        />
        <div className="narrow stack">
          <p className="quiet">Leaving this page ends the guest trial.</p>
          <div className="actions">
            <a className="btn gold" href="/register">
              Create an account
            </a>
            <a className="btn ghost" href="/login">
              Log in
            </a>
          </div>
          <noscript>
            <ol>
              {LAB_PROGRESS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <p>This page continues on its own when the observation is finished.</p>
          </noscript>
          <Disclaimer lead={LAB_DISCLAIMER} responsible={LAB_RESPONSIBLE} />
        </div>
      </main>
    );
  }

  if (row.status === "error" || !row.outcome) {
    return (
      <main id="content" className="narrow stack">
        <p className="system-card">{SYSTEM_TRY_AGAIN}</p>
        <form action={abandonGuest}>
          <Bench />
          <SubmitButton>Try again</SubmitButton>
        </form>
      </main>
    );
  }

  const after = stablePick(LAB_AFTER, row.id);
  const zone = COUNTRY_TIMEZONES[row.countryCode] ?? "UTC";
  const drawDays = asStringArray(row.drawDays);
  const main = asNumberArray(row.mainNumbers) ?? [];
  const bonus = asNumberArray(row.bonusNumbers);
  return (
    <main id="content" className="narrow stack">
      {row.outcome === "numbers" && row.sentimentMessage && row.confidenceLevel ? (
        <NumbersCard
          lottoName={row.lottoName}
          countryName={row.countryName}
          mainNumbers={main}
          bonusNumbers={bonus}
          confidenceLevel={row.confidenceLevel}
          sentimentMessage={row.sentimentMessage}
          createdLabel={formatReadingDate(new Date(row.requestedAt), zone)}
          nextDraw={nextDrawLabel(drawDays, zone)}
          phraseOverride={labPhrase(row.confidenceLevel)}
          feeling={LAB_FEELING}
          attribution="LottoLab recorded these numbers."
        />
      ) : (
        <>
          <RefusalCard voice="LottoLab" message={row.refusalMessage || "The sample did not resolve. You may run the trial again."} />
          <form action={abandonGuest}>
            <Bench />
            <SubmitButton variant="ghost">Run the trial again</SubmitButton>
          </form>
        </>
      )}
      <p>{after}</p>
      <div className="actions">
        <a className="btn gold" href="/register">
          Create an account
        </a>
        <a className="btn ghost" href="/login">
          Log in
        </a>
      </div>
      <Disclaimer lead={LAB_DISCLAIMER} responsible={LAB_RESPONSIBLE} />
    </main>
  );
}
