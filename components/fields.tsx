"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function TimezoneField({ zones, defaultValue }: { zones: string[]; defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue || "");
  useEffect(() => {
    if (defaultValue) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zones.includes(zone)) setValue(zone);
  }, [defaultValue, zones]);
  return (
    <label>
      Timezone
      <select name="timezone" required value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="">Choose a timezone</option>
        {zones.map((zone) => (
          <option key={zone} value={zone}>
            {zone.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CopyLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState(`/share/${token}`);
  useEffect(() => {
    setHref(`${window.location.origin}/share/${token}`);
  }, [token]);
  return (
    <div className="share-box">
      <p className="quiet">
        Anyone with this link can view this reading while it is active. You can revoke it from History.
      </p>
      <code>{href}</code>
      <button
        className="btn ghost"
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(href);
          setCopied(true);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

export function PendingNote() {
  const { pending } = useFormStatus();
  return pending ? <p className="quiet">One moment…</p> : null;
}
