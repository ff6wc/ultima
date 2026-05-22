import { FlagPreset } from "~/types/preset";

export const normalizePresets = (data: any): Record<string, FlagPreset> => {
  if (!data) return {};
  const presetsArray = Array.isArray(data) ? data : Object.values(data);
  return presetsArray.reduce((acc: Record<string, FlagPreset>, p: any) => {
    const name = p ? (p.preset_name || p.name) : null;
    if (p && name) {
      let flags = p.flags || "";
      if (name.toLowerCase() === "atma series" && typeof flags === "string") {
        if (flags.includes("-si ")) {
          if (flags.includes(".233.3.3") && !flags.includes(".222.3.3")) {
            flags = flags.replace(".233.3.3", ".233.3.3.222.3.3");
          } else if (flags.includes(".222.3.3") && !flags.includes(".233.3.3")) {
            flags = flags.replace(".222.3.3", ".233.3.3.222.3.3");
          }
        }
      }

      const normalizedPreset = {
        ...p,
        name: name,
        flags: flags
      };
      acc[name.toLowerCase()] = normalizedPreset;
    }
    return acc;
  }, {});
};
