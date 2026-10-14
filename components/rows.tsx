"use client";

import { useRef, useState } from "react";
import { askKaspah, shareReading } from "@/app/actions/reading";
import type { ReadingDTO, RowDTO } from "@/lib/dto";
import { shortDays } from "@/lib/dates";
import { CopyLink } from "./fields";
import { NumbersCard, RefusalCard } from "./ui";

export function ReadingRows({ rows }: { rows: RowDTO[] }) {
  return (
    <div className="rows">
      {rows.map((row) => (
        <LottoRow key={row.lottoId} initial={row} />
      ))}
    </div>
  );
}

function LottoRow({ initial }: { initial: RowDTO }) {
  const [reading, setReading] = useState<ReadingDTO | null>(initial.reading);
  const [pending, setPending] = useState(false);
  const [veil, setVeil] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(initial.reading?.shareToken ?? null);
  const [shareError, setShareError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  function hideVeil() {
    if (timer.current) window.clearTimeout(timer.current);
    setVeil(false);
  }

  async function ask() {
    setPending(true);
    setError(null);
    const result = await askKaspah(initial.lottoId);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setReading(result.reading);
    setToken(null);
    setVeil(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVeil(false), 1100);
  }

  async function share() {
    if (!reading) return;
    setShareError(null);
    const result = await shareReading(reading.id);
    if (result.token) setToken(result.token);
    if (result.error) setShareError(result.error);
  }

  return (
    <article className="row-card" aria-labelledby={`lotto-${initial.lottoId}`}>
      <div className="row-head">
        <h2 id={`lotto-${initial.lottoId}`}>
          {initial.lottoName}
          <span className="meta"> · {initial.countryName}</span>
        </h2>
        <p className="meta">Draws: {shortDays(initial.drawDays)}</p>
      </div>
      {!initial.isActive ? <p className="retired">This lotto is no longer available for a new reading.</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {veil ? (
        <div className="veil">
          <p className="kaspah">The glass turns once, and no longer.</p>
          <button className="btn ghost" type="button" onClick={hideVeil}>
            Skip
          </button>
        </div>
      ) : reading?.outcome === "numbers" && reading.mainNumbers && reading.confidenceLevel && reading.sentimentMessage ? (
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
      ) : reading?.outcome === "refusal" && reading.refusalMessage ? (
        <RefusalCard message={reading.refusalMessage} />
      ) : (
        <p className="kaspah">Kaspah has not yet gazed upon this game for you.</p>
      )}
      <div className="actions">
        {initial.isActive ? (
          <button className="btn gold" type="button" disabled={pending || veil} onClick={ask}>
            {pending ? "Kaspah is listening…" : reading ? `Ask Kaspah again for ${initial.lottoName}` : `Ask Kaspah for ${initial.lottoName}`}
          </button>
        ) : null}
        {!veil && reading?.outcome === "numbers" ? (
          <button className="btn ghost" type="button" onClick={share}>
            Share this reading
          </button>
        ) : null}
      </div>
      {!veil && reading?.outcome === "numbers" ? (
        <p className="quiet">Anyone with a share link can view this reading while the link is active. You can revoke it from History.</p>
      ) : null}
      {shareError ? <p className="form-error">{shareError}</p> : null}
      {token && !veil ? <CopyLink token={token} /> : null}
    </article>
  );
}
