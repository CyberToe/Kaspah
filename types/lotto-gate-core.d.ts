declare module "lotto-gate-core" {
  export type IsolatorGame = {
    name: string;
    k: number;
    maxN: number;
  };

  export type IsolatorAnalysis = {
    game: string;
    k: number;
    maxN: number;
    corpus: number[][];
    sMean: number;
    sSd: number;
    freq: Record<number, number>;
  };

  export const GAMES: Record<string, IsolatorGame>;
  export const TIERS: string[];
  export const SIGMA: Record<string, number>;

  export function analyze(
    game: string,
    draws: Array<number[] | { numbers: number[] }>,
  ): IsolatorAnalysis;

  export function generate(
    analysis: IsolatorAnalysis,
    options?: {
      tier?: string;
      count?: number;
      rng?: () => number;
      maxAttempts?: number;
    },
  ): number[][];

  export function sample(maxN: number, k: number, rng: () => number): number[];
  export function passes(combo: number[], analysis: IsolatorAnalysis, tier?: string): boolean;
}
