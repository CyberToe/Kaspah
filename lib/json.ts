export function asJson<T>(value: unknown): T | null {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return (value ?? null) as T | null;
}

export function asNumberArray(value: unknown): number[] | null {
  if (value == null) return null;
  const parsed = asJson<unknown>(value) ?? value;
  if (!Array.isArray(parsed)) return null;
  return parsed.map(Number);
}

export function asStringArray(value: unknown): string[] {
  if (value == null) return [];
  const parsed = asJson<unknown>(value) ?? value;
  if (!Array.isArray(parsed)) return [];
  return parsed.map(String);
}

export function asTouches(value: unknown) {
  if (value == null) return null;
  const parsed = (typeof value === "string" ? asJson<Record<string, unknown>>(value) : value) as
    | Record<string, unknown>
    | null;
  if (!parsed || typeof parsed !== "object") return null;
  const dates = Array.isArray(parsed.dates) ? parsed.dates : [];
  return {
    luckyNumbers: Array.isArray(parsed.luckyNumbers) ? parsed.luckyNumbers.map(Number).filter(Number.isFinite) : [],
    names: Array.isArray(parsed.names) ? parsed.names.map(String) : [],
    words: Array.isArray(parsed.words) ? parsed.words.map(String) : [],
    dates: dates
      .map((entry) => {
        const row = entry as { date?: unknown; label?: unknown };
        return { date: String(row.date ?? ""), label: String(row.label ?? "") };
      })
      .filter((entry) => entry.date),
  };
}
