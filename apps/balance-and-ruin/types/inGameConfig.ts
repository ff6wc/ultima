export type InGameConfig = {
  batMode: "active" | "wait";
  batSpeed: number; // 1 to 6
  msgSpeed: number; // 1 to 6
  cmdSet: "window" | "short";
  gauge: "on" | "off";
  sound: "stereo" | "mono";
  cursor: "reset" | "memory";
  reequip: "optimum" | "empty";
  controller: "single" | "multiple";
};

export const DEFAULT_IN_GAME_CONFIG: InGameConfig = {
  batMode: "wait",
  batSpeed: 3,
  msgSpeed: 3,
  cmdSet: "window",
  gauge: "on",
  sound: "stereo",
  cursor: "reset",
  reequip: "optimum",
  controller: "single",
};
