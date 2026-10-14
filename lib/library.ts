export type LineKind =
  | "sentiment"
  | "refusal"
  | "refusal_name"
  | "guest_progress"
  | "guest_pitch"
  | "guest_after"
  | "weave_name"
  | "weave_word"
  | "weave_date"
  | "lucky_disclosure";

export type LineSeed = {
  id: string;
  kind: LineKind;
  confidenceLevel: number | null;
  body: string;
};

const sentiments: Record<number, string[]> = {
  1: [
    "The mist barely parts tonight... but something small and patient is there.",
    "A thin thread of silver crosses the glass, shy as a moth.",
    "I hear only a hush, like snow deciding whether to fall.",
    "The ball is dim, yet a quiet hand seems to tap the glass from within.",
    "Not a blaze — a breath. These numbers arrived on tiptoe.",
    "Kaspah leans close. The glass murmurs, and no more.",
  ],
  2: [
    "A soft light, like a candle behind silk. Kaspah nods, slowly.",
    "Warmth gathers at the rim, gentle as a lantern in a corridor.",
    "The mists thin, and a kindly glow sits in the centre.",
    "I feel a small yes in the glass, unhurried and sincere.",
    "Moonlight, not noon. These numbers rest easy in the palm of the ball.",
    "A hush of gold, no louder than a page turning.",
  ],
  3: [
    "The ball is clear tonight, the stars sit still, and these numbers rest well.",
    "No storm in the glass. The numbers stand in an open field of light.",
    "Kaspah sees a calm horizon and these figures upon it.",
    "The crystal holds its breath, then offers a steady, even glow.",
    "Clear as a winter sky just after dusk. I am content with this.",
    "The mists step aside. What remains is simple and bright.",
  ],
  4: [
    "Ahh, warmth rises in the glass. These numbers stepped forward on their own.",
    "The ball glows warm as a lantern in the desert night — I did not chase them.",
    "Heat in the palms, gold in the sphere. Kaspah smiles despite himself.",
    "These came forward like guests who already knew the way.",
    "The crystal hums, low and pleased. I trust this warmth.",
    "A lantern-light reading. The numbers arrived before I called.",
  ],
  5: [
    "Rare and bright! Kaspah has not felt the glass burn like this in many moons.",
    "The ball blazes like a captured sun. Stand back — and look.",
    "Fire without smoke. The sphere is a small dawn, and these are its rays.",
    "I have seen comets quieter than this glass tonight.",
    "The chamber itself seems to lean in. Such a blaze is uncommon.",
    "Gold, then white-gold. Kaspah laughs once, softly, at the brightness.",
  ],
};

const refusals = [
  "The mist has not settled. The numbers are not here, and I will not invent them. Ask Kaspah again when you are ready.",
  "I look, and the ball looks away. Not for this game, just now. You may ask again at once — the door is not shut.",
  "Some evenings the glass keeps its own counsel. This is one. Ask again whenever you wish.",
  "I will not force a handful of digits out of a silent sphere. Try once more; nothing bars you.",
  "The vibe is wrong, dear seeker, and false numbers would be a poor gift. Ask Kaspah again.",
  "No stars, no balls, no pretending. The crystal is cloudy for this lotto. You are free to ask again now.",
  "I set my hands on the glass and feel only cool quiet. Ask again when you like — there is no waiting period in this house.",
  "The numbers did not step forward. I respect that. Ask me again, for this game or another.",
];

const refusalNames = [
  "Even for {name}, the ball is quiet tonight. The mist has not settled. Ask Kaspah again when you are ready.",
  "I whispered {name} toward the glass and received only fog. You are not barred — ask again.",
  "{name} is remembered, but the sphere will not speak of this game yet. Ask once more whenever you wish.",
];

const guestProgress = [
  "Hush now... the Great Kaspah turns to the crystal...",
  "The mists swirl... shapes move behind the glass...",
  "Patience, traveller. The numbers do not hurry for anyone...",
  "Lantern-light gathers. I am listening, not guessing...",
  "A hush in the chamber. Let the ball finish its thought...",
  "Gold dust turns in the sphere. Almost, almost...",
];

const guestPitch = [
  "Kaspah is reviewing the glass — and know this: those who create an account and log in are seen far faster. The ball favours its friends.",
  "For faster results, create an account and log in. Guests wait while the mists do their slow work; the house knows its own.",
];

const guestAfter = [
  "See how the ball rewards patience? Create an account, log in, and next time Kaspah will greet you by name — and far, far faster.",
  "The guest road is a single lantern. An account is the key to the inner chamber, where the glass answers swiftly.",
];

const weaveNames = [
  "Kaspah thinks warmly of {name} as the light moves.",
  "A quiet blessing toward {name}, with no promise but goodwill.",
  "The name {name} is spoken softly over the glass, as a friend, not a charm.",
];

const weaveWords = [
  "The word “{word}” drifts through the mist like incense.",
  "I fold {word} into the imagery, a private note in the margin of the night.",
];

const weaveDates = [
  "This reading falls near {label}, and Kaspah bows to that day.",
  "{label} is close on the calendar. The glass acknowledges it with a nod, nothing more.",
];

const luckyDisclosure = [
  "Your lucky number {n} stepped forward. A number you offered confers no advantage — every valid combination has the same chance of being drawn.",
];

function rows(kind: LineKind, bodies: string[], level: number | null, prefix: string): LineSeed[] {
  return bodies.map((body, index) => ({
    id: `${prefix}-${index + 1}`,
    kind,
    confidenceLevel: level,
    body,
  }));
}

export const STARTER_LINES: LineSeed[] = [
  ...[1, 2, 3, 4, 5].flatMap((level) =>
    rows("sentiment", sentiments[level]!, level, `sentiment-${level}`),
  ),
  ...rows("refusal", refusals, null, "refusal"),
  ...rows("refusal_name", refusalNames, null, "refusal-name"),
  ...rows("guest_progress", guestProgress, null, "guest-progress"),
  ...rows("guest_pitch", guestPitch, null, "guest-pitch"),
  ...rows("guest_after", guestAfter, null, "guest-after"),
  ...rows("weave_name", weaveNames, null, "weave-name"),
  ...rows("weave_word", weaveWords, null, "weave-word"),
  ...rows("weave_date", weaveDates, null, "weave-date"),
  ...rows("lucky_disclosure", luckyDisclosure, null, "lucky"),
];

export type LibraryBuckets = {
  sentiments: Record<number, string[]>;
  refusals: string[];
  refusalNames: string[];
  weaveNames: string[];
  weaveWords: string[];
  weaveDates: string[];
  luckyDisclosure: string[];
};

export function bucketsFromLines(
  lines: { kind: string; confidenceLevel: number | null; body: string }[],
): LibraryBuckets {
  const buckets: LibraryBuckets = {
    sentiments: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    refusals: [],
    refusalNames: [],
    weaveNames: [],
    weaveWords: [],
    weaveDates: [],
    luckyDisclosure: [],
  };
  for (const line of lines) {
    if (line.kind === "sentiment" && line.confidenceLevel) {
      buckets.sentiments[line.confidenceLevel]?.push(line.body);
    } else if (line.kind === "refusal") buckets.refusals.push(line.body);
    else if (line.kind === "refusal_name") buckets.refusalNames.push(line.body);
    else if (line.kind === "weave_name") buckets.weaveNames.push(line.body);
    else if (line.kind === "weave_word") buckets.weaveWords.push(line.body);
    else if (line.kind === "weave_date") buckets.weaveDates.push(line.body);
    else if (line.kind === "lucky_disclosure") buckets.luckyDisclosure.push(line.body);
  }
  const fallback = bucketsFromLinesUnchecked(STARTER_LINES);
  for (const level of [1, 2, 3, 4, 5]) {
    if (!buckets.sentiments[level]?.length) buckets.sentiments[level] = fallback.sentiments[level]!;
  }
  if (!buckets.refusals.length) buckets.refusals = fallback.refusals;
  if (!buckets.refusalNames.length) buckets.refusalNames = fallback.refusalNames;
  if (!buckets.weaveNames.length) buckets.weaveNames = fallback.weaveNames;
  if (!buckets.weaveWords.length) buckets.weaveWords = fallback.weaveWords;
  if (!buckets.weaveDates.length) buckets.weaveDates = fallback.weaveDates;
  if (!buckets.luckyDisclosure.length) buckets.luckyDisclosure = fallback.luckyDisclosure;
  return buckets;
}

function bucketsFromLinesUnchecked(lines: LineSeed[]): LibraryBuckets {
  const buckets: LibraryBuckets = {
    sentiments: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    refusals: [],
    refusalNames: [],
    weaveNames: [],
    weaveWords: [],
    weaveDates: [],
    luckyDisclosure: [],
  };
  for (const line of lines) {
    if (line.kind === "sentiment" && line.confidenceLevel) {
      buckets.sentiments[line.confidenceLevel]?.push(line.body);
    } else if (line.kind === "refusal") buckets.refusals.push(line.body);
    else if (line.kind === "refusal_name") buckets.refusalNames.push(line.body);
    else if (line.kind === "weave_name") buckets.weaveNames.push(line.body);
    else if (line.kind === "weave_word") buckets.weaveWords.push(line.body);
    else if (line.kind === "weave_date") buckets.weaveDates.push(line.body);
    else if (line.kind === "lucky_disclosure") buckets.luckyDisclosure.push(line.body);
  }
  return buckets;
}

export function linesOf(kind: LineKind): string[] {
  return STARTER_LINES.filter((line) => line.kind === kind).map((line) => line.body);
}
