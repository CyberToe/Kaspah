import { DISCLAIMER, FEELING_NOTE, RESPONSIBLE } from "@/lib/constants";
import { phraseFor } from "@/lib/phrases";

export function Disclaimer() {
  return (
    <aside className="disclaimer">
      <p>{DISCLAIMER}</p>
      <p>{RESPONSIBLE}</p>
    </aside>
  );
}

export function Balls({ main, bonus }: { main: number[]; bonus?: number[] | null }) {
  return (
    <div>
      <ol className="balls">
        {main.map((number) => (
          <li key={number} className="ball">
            {number}
          </li>
        ))}
      </ol>
      {bonus && bonus.length > 0 ? (
        <div className="bonus-line">
          <span className="bonus-label">Bonus</span>
          <ol className="balls">
            {bonus.map((number) => (
              <li key={`bonus-${number}`} className="ball bonus">
                {number}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

export function Stars({ level }: { level: number }) {
  return (
    <p className="stars">
      <span className="star-row" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= level ? "star" : "star off"}>
            ★
          </span>
        ))}
      </span>
      <span>
        {level} of 5 stars
      </span>
    </p>
  );
}

export function NumbersCard({
  lottoName,
  countryName,
  mainNumbers,
  bonusNumbers,
  confidenceLevel,
  sentimentMessage,
  personalNote,
  createdLabel,
  nextDraw,
  provided = true,
}: {
  lottoName: string;
  countryName: string;
  mainNumbers: number[];
  bonusNumbers?: number[] | null;
  confidenceLevel: number;
  sentimentMessage: string;
  personalNote?: string | null;
  createdLabel: string;
  nextDraw?: string | null;
  provided?: boolean;
}) {
  const phrase = phraseFor(confidenceLevel);
  return (
    <div className="reading">
      <p className="meta">
        {lottoName} · {countryName}
      </p>
      <Balls main={mainNumbers} bonus={bonusNumbers} />
      {phrase ? <h3 className="phrase">{phrase}</h3> : null}
      <p className="kaspah">{sentimentMessage}</p>
      {personalNote ? <p className="kaspah">{personalNote}</p> : null}
      <Stars level={confidenceLevel} />
      <p className="feeling-note">{FEELING_NOTE}</p>
      <p className="quiet">
        {createdLabel}
        {nextDraw ? ` · ${nextDraw}` : ""}
      </p>
      {provided ? <p className="quiet">The Great Kaspah provided these numbers.</p> : null}
    </div>
  );
}

export function RefusalCard({ message }: { message: string }) {
  return (
    <div>
      <p className="voice">The Great Kaspah</p>
      <p className="kaspah">{message}</p>
    </div>
  );
}
