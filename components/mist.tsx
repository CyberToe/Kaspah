"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

function Across({
  title,
  detail,
  line,
  pitch,
  progress,
  portrait = "/kaspah.jpeg",
}: {
  title: string;
  detail?: string;
  line?: string;
  pitch?: string;
  progress: number | null;
  portrait?: string;
}) {
  return (
    <section className="reading-banner" role="status" aria-live="polite">
      <div className="reading-sweep" aria-hidden="true" />
      <div className="reading-banner-inner">
        <figure className="presence reading-presence">
          <img src={portrait} alt="" width={689} height={947} />
        </figure>
        <div>
          <p className="reading-status">{title}</p>
          {detail ? <p className="reading-detail">{detail}</p> : null}
          {line ? <p className="kaspah">{line}</p> : null}
          {pitch ? <p className="reading-pitch">{pitch}</p> : null}
        </div>
      </div>
      <div className="reading-track" aria-hidden="true">
        <span className={progress == null ? "reading-fill reading-fill-unknown" : "reading-fill"} style={progress == null ? undefined : { width: `${Math.round(progress * 100)}%` }} />
        <span className="reading-glow" />
      </div>
    </section>
  );
}

export function GuestAsking({
  portrait = "/kaspah.jpeg",
  title = "A reading is on its way",
  detail = "Kaspah has turned to the glass. Stay on this page.",
}: {
  portrait?: string;
  title?: string;
  detail?: string;
} = {}) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="reading-banner-fixed">
      <Across title={title} detail={detail} progress={null} portrait={portrait} />
    </div>
  );
}

export function MistLines({
  lines,
  pitch,
  lottoName,
  requestedAt,
  revealAt,
  portrait = "/kaspah.jpeg",
  waitingTitle = "A reading is on its way",
  readyTitle = "Your reading is ready",
  waitingDetail,
  readyDetail,
}: {
  lines: string[];
  pitch: string;
  lottoName: string;
  requestedAt: string;
  revealAt: string;
  portrait?: string;
  waitingTitle?: string;
  readyTitle?: string;
  waitingDetail?: string;
  readyDetail?: string;
}) {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (lines.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 3200);
    return () => window.clearInterval(timer);
  }, [lines.length]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, []);

  const start = new Date(requestedAt).getTime();
  const end = new Date(revealAt).getTime();
  const progress = end > start ? Math.min(1, Math.max(0, (now - start) / (end - start))) : null;
  const ready = progress != null && progress >= 1;

  return (
    <Across
      portrait={portrait}
      title={ready ? readyTitle : waitingTitle}
      detail={ready ? readyDetail ?? `${lottoName}. The page will show it in a moment.` : waitingDetail ?? `${lottoName}. The glass is still turning. Stay on this page.`}
      line={lines[index] ?? lines[0]}
      pitch={pitch}
      progress={progress}
    />
  );
}
