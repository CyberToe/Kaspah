"use client";

import { useEffect, useState } from "react";

export function MistLines({ lines, pitch }: { lines: string[]; pitch: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (lines.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 3200);
    return () => window.clearInterval(timer);
  }, [lines.length]);
  return (
    <div>
      <div className="crystal" aria-hidden="true">
        <div className="crystal-mist" />
      </div>
      <p className="voice">The Great Kaspah</p>
      <p className="kaspah" aria-live="polite">
        {lines[index] ?? lines[0]}
      </p>
      <p className="kaspah">{pitch}</p>
    </div>
  );
}
