import { FlagPreset } from "~/types/preset";

export const normalizePresets = (data: any): Record<string, FlagPreset> => {
  if (!data) return {};
  const presetsArray = Array.isArray(data) ? data : Object.values(data);
  return presetsArray.reduce((acc: Record<string, FlagPreset>, p: any) => {
    const name = p ? (p.preset_name || p.name) : null;
    if (p && name) {
      const normalizedPreset = {
        ...p,
        name: name
      };
      acc[name.toLowerCase()] = normalizedPreset;
    }
    return acc;
  }, {});
};
