export type ReadingDTO = {
  id: string;
  outcome: "numbers" | "refusal";
  lottoName: string;
  countryName: string;
  drawDays: string[];
  mainNumbers: number[] | null;
  bonusNumbers: number[] | null;
  confidenceLevel: number | null;
  sentimentMessage: string | null;
  personalNote: string | null;
  refusalMessage: string | null;
  createdLabel: string;
  nextDraw: string | null;
  shareToken: string | null;
};

export type RowDTO = {
  lottoId: string;
  lottoName: string;
  countryName: string;
  drawDays: string[];
  isActive: boolean;
  reading: ReadingDTO | null;
};

export type AskResult = { ok: true; reading: ReadingDTO } | { ok: false; message: string };
