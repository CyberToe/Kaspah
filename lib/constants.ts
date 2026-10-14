export const COOKIE_SESSION = "kaspah_session";
export const COOKIE_GUEST = "kaspah_guest";
export const COOKIE_GUEST_COUNTRY = "kaspah_guest_country";

export const DISCLAIMER =
  "The Great Kaspah is for entertainment only. Numbers are generated at random, no reading changes the odds of winning, and this app does not provide financial or gambling advice.";

export const RESPONSIBLE =
  "Buying a lottery ticket is age-restricted in most places. Follow the rules where you live. This app does not sell tickets, take money, check results, or claim prizes. A reading, a feeling, or a refusal is never a reason to spend more.";

export const FEELING_NOTE =
  "Kaspah's feeling is not a probability, and it is not a claim that one set is more likely to win. Every valid combination has the same chance of being drawn.";

export const SYSTEM_TRY_AGAIN =
  "Something went wrong preparing this reading. Please try again.";

export const RANDOM_PROVIDER = { name: "random", version: "1.0.0" } as const;

export const DEFAULT_WEIGHTS = [30, 28, 22, 15, 5];
export const DEFAULT_REFUSAL_RATE = 0.1;
export const DEFAULT_GUEST_DELAY = 12;

export const SHARE_CTA = "Want your own numbers? Create an account and log in.";

export const COUNTRY_TIMEZONES: Record<string, string> = {
  CA: "America/Toronto",
  US: "America/New_York",
  GB: "Europe/London",
  IE: "Europe/Dublin",
  DE: "Europe/Berlin",
};
