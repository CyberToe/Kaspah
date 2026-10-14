export const CONFIDENCE_PHRASES: Record<number, string> = {
  1: "Faint whisper through the mist",
  2: "A gentle glow in the glass",
  3: "Clear skies over the crystal",
  4: "The ball glows warm as a lantern",
  5: "The ball blazes like a captured sun",
};

export function phraseFor(level: number | null | undefined): string | null {
  if (!level) return null;
  return CONFIDENCE_PHRASES[level] ?? null;
}
