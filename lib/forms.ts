import type { Touches } from "./engine";

export type FormState = {
  error?: string;
  warning?: string;
  pendingCountry?: string;
  saved?: boolean;
  message?: string;
  devLink?: string;
};

const ZONES = new Set<string>();

export function timeZones() {
  if (ZONES.size === 0) {
    for (const zone of Intl.supportedValuesOf("timeZone")) ZONES.add(zone);
  }
  return [...ZONES];
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return null;
  return email;
}

export function passwordError(value: unknown) {
  if (typeof value !== "string" || value.length < 8 || value.length > 72) {
    return "Use a password of 8 to 72 characters.";
  }
  return null;
}

export function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.replace(/\s+/g, " ").trim();
  if (!name || name.length > 40) return null;
  return name;
}

export function parseCalendarDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day || year < 1900 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  return value;
}

export function parseDob(value: unknown) {
  const date = parseCalendarDate(value);
  if (!date) return null;
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (date > tomorrow) return null;
  return date;
}

export function parseZone(value: unknown) {
  if (typeof value !== "string" || !timeZones().includes(value)) return null;
  return value;
}

function listField(value: unknown, maxItems: number, maxLength: number) {
  if (typeof value !== "string") return [];
  const parts = value
    .split(/[\n,]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return [...new Set(parts.map((part) => part.slice(0, maxLength)))].slice(0, maxItems);
}

export function parseTouches(formData: FormData): { ok: true; touches: Touches } | { ok: false; error: string } {
  const lucky = listField(formData.get("luckyNumbers"), 8, 6)
    .map((part) => Number(part))
    .filter((n) => Number.isInteger(n));
  if (lucky.some((n) => n < 0 || n > 999)) {
    return { ok: false, error: "Lucky numbers should be whole numbers from 0 to 999." };
  }
  const names = listField(formData.get("names"), 5, 40);
  const words = listField(formData.get("words"), 5, 30);
  const dates: { date: string; label: string }[] = [];
  for (let index = 1; index <= 3; index += 1) {
    const rawDate = String(formData.get(`date${index}`) || "");
    const label = String(formData.get(`label${index}`) || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
    if (!rawDate && !label) continue;
    const parsed = parseCalendarDate(rawDate);
    if (!parsed) return { ok: false, error: "Check the significant dates. Each one needs a real calendar date." };
    if (!label) return { ok: false, error: "Each significant date needs a short label." };
    dates.push({ date: parsed, label });
  }
  return { ok: true, touches: { luckyNumbers: [...new Set(lucky)].slice(0, 8), names, words, dates } };
}

export function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}
