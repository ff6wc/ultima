import { NONE } from "@ff6wc/ff6-types";

export const LEGACY_REC_FLAGS = [
  "-rec1",
  "-rec2",
  "-rec3",
  "-rec4",
  "-rec5",
  "-rec6",
] as const;

export const parseExcluded = (
  recRaw: string | null | undefined,
  legacy: unknown[],
): number[] => {
  if (recRaw !== undefined && recRaw !== null) {
    if (!recRaw) return [];
    return recRaw
      .split(".")
      .map(Number)
      .filter((n) => !isNaN(n) && n !== NONE);
  }
  return legacy
    .map(Number)
    .filter((n) => !isNaN(n) && n !== NONE);
};
