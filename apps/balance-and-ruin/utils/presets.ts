import { FlagPreset } from "~/types/preset";

export const normalizePresets = (data: any): Record<string, FlagPreset> => {
  if (!data) return {};
  const presetsArray = Array.isArray(data) ? data : Object.values(data);
  return presetsArray.reduce((acc: Record<string, FlagPreset>, p: any) => {
    const name = p ? p.preset_name || p.name : null;
    if (p && name) {
      let flags = p.flags || "";
      if (
        name.toLowerCase().includes("atma series") &&
        typeof flags === "string"
      ) {
        const siMatch = flags.match(/-si\s+([^\s]+)/);
        if (siMatch) {
          const siValue = siMatch[1];
          const parts = siValue?.split(".") || [];
          const items: { id: string; min: string; max: string }[] = [];
          for (let i = 0; i < parts.length; i += 3) {
            if (parts[i]) {
              items.push({
                id: parts[i],
                min: parts[i + 1] || "1",
                max: parts[i + 2] || "1",
              });
            }
          }

          const hasMoogleCharm = items.some((item) => item.id === "222");
          const hasPotion = items.some((item) => item.id === "233");

          let changed = false;
          if (!hasMoogleCharm) {
            items.push({ id: "222", min: "3", max: "3" });
            changed = true;
          }
          if (!hasPotion) {
            items.push({ id: "233", min: "3", max: "3" });
            changed = true;
          }

          if (changed) {
            const newSiValue = items
              .map((item) => `${item.id}.${item.min}.${item.max}`)
              .join(".");
            flags = flags.replace(`-si ${siValue}`, `-si ${newSiValue}`);
          }
        } else {
          // If no -si flag exists, append it with both items
          flags += " -si 233.3.3.222.3.3";
        }
      }

      const normalizedPreset = {
        ...p,
        name: name,
        flags: flags,
      };
      acc[name.toLowerCase()] = normalizedPreset;
    }
    return acc;
  }, {});
};
