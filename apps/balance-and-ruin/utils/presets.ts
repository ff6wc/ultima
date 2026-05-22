import { FlagPreset } from "~/types/preset";

export const normalizePresets = (data: any): Record<string, FlagPreset> => {
  if (!data) return {};
  const presetsArray = Array.isArray(data) ? data : Object.values(data);
  return presetsArray.reduce((acc: Record<string, FlagPreset>, p: any) => {
    if (p && p.name) {
      acc[p.name.toLowerCase()] = p;
    }
    return acc;
  }, {});
};
