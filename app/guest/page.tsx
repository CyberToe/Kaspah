import { abandonGuest, clearGuestCountry, setGuestCountry, startGuestReading } from "@/app/actions/guest";
import { MistLines } from "@/components/mist";
import { SubmitButton } from "@/components/submit";
import { Disclaimer, NumbersCard, RefusalCard } from "@/components/ui";
import { COOKIE_GUEST, COOKIE_GUEST_COUNTRY, COUNTRY_TIMEZONES, SYSTEM_TRY_AGAIN } from "@/lib/constants";
import { formatReadingDate, nextDrawLabel } from "@/lib/dates";
import { findGuest, linesByKind, lottosForCountry, offeredCountries } from "@/lib/data";
import { asNumberArray, asStringArray } from "@/lib/json";
import { linesOf, type LineKind } from "@/lib/library";
import { getCurrentUser, readCookie } from "@/lib/session";
import { redirect } from "next/navigation";

function stablePick(items: string[], key: string) {
  if (!items.length) return "";
  let hash = 0;
  for (const char of key) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return items[hash % items.length] ?? items[0]!;
}

async function copy(kind: LineKind) {
  const stored = await linesByKind(kind);
  return stored.length ? stored : linesOf(kind);
}

export default async function GuestPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  if (await getCurrentUser()) redirect("/readings");
  const notice = (await searchParams).notice;
  const guestId = await readCookie(COOKIE_GUEST);
  if (guestId) {
    const row = await findGuest(guestId);
    if (row) return <GuestChamber row={row} />;
  }

  const country = await readCookie(COOKIE_GUEST_COUNTRY);
  const countries = (await offeredCountries()) as { code: string; name: string }[];
  if (!country) {
    return (
      <main id="content" className="narrow stack">
        <p className="voice">The Great Kaspah</p>
        <p className="kaspah">No account? No matter. Step closer, traveller, and let the Great Kaspah gaze for you — once, as a guest.</p>
        <p className="kaspah">Where are you from? Speak the country, and only then will I name the games I can see.</p>
        {notice === "quiet" ? <p className="system-card">The crystal needs a quiet moment. Please try again shortly.</p> : null}
        {notice === "country" ? <p className="form-error">Choose a country from the list.</p> : null}
        <form action={setGuestCountry} className="stack auth-card">
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
          <SubmitButton>Tell Kaspah</SubmitButton>
        </form>
        <Disclaimer />
      </main>
    );
  }

  const games = await lottosForCountry(country, true);
  const place = countries.find((item) => item.code === country)?.name ?? country;
  if (!games.length) {
    return (
      <main id="content" className="narrow stack">
        <p className="kaspah">The glass is quiet for that land, traveller. No lotto there is awake for me yet. Choose another country, and I will look again.</p>
        <form action={clearGuestCountry}>
          <SubmitButton variant="ghost">Choose another country</SubmitButton>
        </form>
      </main>
    );
  }

  return (
    <main id="content" className="narrow stack">
      <p className="voice">The Great Kaspah</p>
      <p className="kaspah">And which lotto in {place} shall I gaze upon? One only, for a guest.</p>
      {notice === "lotto" ? <p className="form-error">Choose one of the lottos offered for that country.</p> : null}
      <form action={startGuestReading} className="stack">
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
        <SubmitButton>Ask the crystal</SubmitButton>
      </form>
      <form action={clearGuestCountry}>
        <button className="text-btn" type="submit">
          Choose a different country
        </button>
      </form>
    </main>
  );
}

async function GuestChamber({
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
  const progress = await copy("guest_progress");
  const pitch = stablePick(await copy("guest_pitch"), row.id);
  if (remaining > 0) {
    return (
      <main id="content" className="narrow stack">
        <meta httpEquiv="refresh" content={String(Math.max(2, Math.ceil(remaining / 1000)))} />
        <MistLines lines={progress} pitch={pitch} />
        <p className="quiet">Leaving this page ends the guest reading.</p>
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
            {progress.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p>This page continues on its own when the review is finished.</p>
        </noscript>
        <Disclaimer />
      </main>
    );
  }

  if (row.status === "error" || !row.outcome) {
    return (
      <main id="content" className="narrow stack">
        <p className="system-card">{SYSTEM_TRY_AGAIN}</p>
        <form action={abandonGuest}>
          <SubmitButton>Try again</SubmitButton>
        </form>
      </main>
    );
  }

  const after = stablePick(await copy("guest_after"), row.id);
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
        />
      ) : (
        <>
          <RefusalCard message={row.refusalMessage || "The mist has not settled. Ask Kaspah again when you are ready."} />
          <form action={abandonGuest}>
            <SubmitButton variant="ghost">Ask Kaspah again</SubmitButton>
          </form>
        </>
      )}
      <p className="kaspah">{after}</p>
      <div className="actions">
        <a className="btn gold" href="/register">
          Create an account
        </a>
        <a className="btn ghost" href="/login">
          Log in
        </a>
      </div>
      <Disclaimer />
    </main>
  );
}
