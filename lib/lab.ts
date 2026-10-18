import type { LibraryBuckets } from "./library";

export const LAB_PHRASES: Record<number, string> = {
  1: "Trace reading",
  2: "Mild reaction",
  3: "Solution cleared",
  4: "Strong separation",
  5: "Full resolution",
};

export const LAB_FEELING =
  "The confidence score is not a probability, and it is not a claim that one set is more likely to win. Numbers are shaped by filters for playable sets; every valid combination still has the same chance of being drawn.";

export const LAB_DISCLAIMER =
  "LottoLab is for entertainment only. Numbers are shaped by filters for playable sets, not as predictions. No trial changes the odds of winning, and this app does not provide financial or gambling advice.";

export const LAB_RESPONSIBLE =
  "Buying a lottery ticket is age-restricted in most places. Follow the rules where you live. This app does not sell tickets, take money, check results, or claim prizes. A result, a confidence score, or an inconclusive trial is never a reason to spend more.";

export const LAB_PROGRESS = [
  "Mixing the solution. The sample has not cleared.",
  "Analysing our findings. The beaker is still active.",
  "Holding the trial at temperature. The numbers are not rushed.",
  "Logging the draw parameters. Observation continues.",
  "The solution is cloudy. We wait for it to settle.",
  "Cross-checking the sample against the draw rules.",
];

export const LAB_PITCH = [
  "The trial is running. Create an account and log in if you want the next result without this observation window.",
  "Guest trials keep the standard delay. An account is processed sooner, and the log is kept under your name.",
];

export const LAB_AFTER = [
  "Observation complete. Create an account and the next trial is filed against your name, without the guest wait.",
  "This was a single guest trial. An account keeps the log and shortens the next run.",
];

const sentiments: Record<number, string[]> = {
  1: [
    "The signal is faint. A set was produced, and nothing more is claimed.",
    "Low activity in the beaker. These values are recorded as observed.",
    "The solution stayed pale. A result is logged with low confidence.",
  ],
  2: [
    "Mild colour change. The set is noted, and the confidence stays modest.",
    "A small reaction. The numbers are stable enough to record.",
    "The sample warmed slightly. These findings are preliminary.",
  ],
  3: [
    "The solution cleared. These numbers are the recorded result of an even trial.",
    "Standard reaction. No anomaly, and the set is logged as observed.",
    "The beaker settled. Confidence is moderate, and the values are entered.",
  ],
  4: [
    "A strong colour change. These numbers separated cleanly from the sample.",
    "The reaction ran hot. The set is recorded with high confidence in the observation, not in the draw.",
    "Clear separation in the glass. The findings are entered.",
  ],
  5: [
    "Rare clarity. The sample resolved at once, and these numbers are the full reading.",
    "The beaker lit uniformly. This degree of separation is uncommon in the log.",
    "Maximum observed response. The set is recorded in full.",
  ],
};

export function labLibrary(): LibraryBuckets {
  return {
    sentiments,
    refusals: [
      "The sample did not resolve. No numbers are recorded for this trial. You may run it again.",
      "The solution stayed cloudy. This game returns no set just now. Start another trial whenever you like.",
      "Analysis was inconclusive. Inventing a result would contaminate the log. Run the trial again.",
      "No separation occurred. The bench is clear for another attempt.",
      "The reaction did not complete. That is a valid outcome. You may repeat the trial now.",
    ],
    refusalNames: [
      "Even with {name} noted on the slip, the sample did not resolve. Run the trial again when you are ready.",
    ],
    weaveNames: ["The name {name} is noted in the margin of the log."],
    weaveWords: ["The term {word} is attached to this trial as a private label."],
    weaveDates: ["{label} falls near this trial and is recorded, nothing more."],
    luckyDisclosure: [
      "Lucky number {n} was included because it was supplied. A supplied number confers no advantage — every valid combination has the same chance of being drawn.",
    ],
  };
}

export function labPhrase(level: number | null | undefined) {
  if (!level) return null;
  return LAB_PHRASES[level] ?? null;
}
