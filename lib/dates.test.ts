import assert from "node:assert/strict";
import test from "node:test";
import { addDays, nextDrawLabel, weekdayOf, zonedYmd } from "./dates";

test("next draw is today when today is a draw day", () => {
  const now = new Date("2026-10-14T15:00:00Z");
  assert.equal(weekdayOf(zonedYmd(now, "UTC")), "Wednesday");
  assert.equal(nextDrawLabel(["Wednesday", "Saturday"], "UTC", now), "Next draw: today");
});

test("next draw skips ahead to the following draw day", () => {
  const thursday = new Date("2026-10-15T15:00:00Z");
  assert.equal(nextDrawLabel(["Wednesday", "Saturday"], "UTC", thursday), "Next draw: Saturday 17 October");
});

test("calendar add stays on the civil date", () => {
  assert.deepEqual(addDays({ y: 2026, m: 10, d: 14 }, 3), { y: 2026, m: 10, d: 17 });
});
