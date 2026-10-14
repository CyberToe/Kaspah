const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SHORT: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

export type Ymd = { y: number; m: number; d: number };

export function zonedYmd(date: Date, timeZone: string): Ymd {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function addDays(ymd: Ymd, days: number): Ymd {
  const utc = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d + days));
  return { y: utc.getUTCFullYear(), m: utc.getUTCMonth() + 1, d: utc.getUTCDate() };
}

export function weekdayOf(ymd: Ymd): string {
  return WEEKDAYS[new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d)).getUTCDay()]!;
}

export function daysBetween(a: Ymd, b: Ymd): number {
  const left = Date.UTC(a.y, a.m - 1, a.d);
  const right = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((right - left) / 86400000);
}

export function shortDays(days: string[]): string {
  return days.map((day) => SHORT[day] ?? day).join(", ");
}

export function formatReadingDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function nextDrawLabel(drawDays: string[], timeZone: string, now = new Date()): string | null {
  if (!drawDays.length) return null;
  const wanted = new Set(drawDays);
  const today = zonedYmd(now, timeZone);
  for (let offset = 0; offset < 7; offset += 1) {
    const day = addDays(today, offset);
    if (!wanted.has(weekdayOf(day))) continue;
    if (offset === 0) return "Next draw: today";
    const label = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(day.y, day.m - 1, day.d)));
    return `Next draw: ${label}`;
  }
  return null;
}

export function nearSignificantDate(
  dates: { date: string; label: string }[],
  timeZone: string,
  now: Date,
): { date: string; label: string } | null {
  const today = zonedYmd(now, timeZone);
  let best: { date: string; label: string; distance: number } | null = null;
  for (const entry of dates) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entry.date);
    if (!match) continue;
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) continue;
    for (const year of [today.y - 1, today.y, today.y + 1]) {
      const anniversary = { y: year, m: month, d: day };
      const probe = new Date(Date.UTC(year, month - 1, day));
      if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) continue;
      const distance = Math.abs(daysBetween(today, anniversary));
      if (distance <= 3 && (!best || distance < best.distance)) {
        best = { ...entry, distance };
      }
    }
  }
  return best ? { date: best.date, label: best.label } : null;
}
