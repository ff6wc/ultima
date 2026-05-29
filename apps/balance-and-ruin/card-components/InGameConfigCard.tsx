import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card } from "@ff6wc/ui";
import {
  DEFAULT_IN_GAME_CONFIG,
  DEFAULT_FONT_COLOR,
  WINDOW_PALETTE_DEFAULTS,
} from "~/types/inGameConfig";
import { FaCaretUp, FaCaretDown, FaCaretLeft, FaCaretRight } from "react-icons/fa";

type RGB = [number, number, number];

type BinaryKey = "BatMode" | "Command" | "Gauge" | "Sound" | "Cursor" | "Reequip";
type NumericKey = "BatSpeed" | "MsgSpeed" | "SpellOrder" | "Wallpaper";

type Editing = { kind: "font" } | { kind: "window" } | { kind: "slot"; slot: number };

type State = {
  page: "A" | "B";
  BatMode: "active" | "wait";
  BatSpeed: number;
  MsgSpeed: number;
  Command: "window" | "short";
  Gauge: "on" | "off";
  Sound: "stereo" | "mono";
  Cursor: "reset" | "memory";
  Reequip: "optimum" | "empty";
  SpellOrder: number;
  Wallpaper: number;
  font: RGB;
  windows: Record<number, RGB[]>;
  editing: Editing;
  cursor: number;
};

type ValueItem = readonly [string | number, number] | readonly [string | number, number, number];

type OptionRow =
  | { key: string; y: number; kind?: undefined; values: ValueItem[] }
  | { key: string; y: number; kind: "color"; values: ValueItem[] }
  | { key: string; y: number; kind: "slider"; channel: 0 | 1 | 2; cursorX: number };

const WINDOW_DEFAULTS: Record<number, RGB[]> = {
  1: WINDOW_PALETTE_DEFAULTS.window1 as RGB[],
  2: WINDOW_PALETTE_DEFAULTS.window2 as RGB[],
  3: WINDOW_PALETTE_DEFAULTS.window3 as RGB[],
  4: WINDOW_PALETTE_DEFAULTS.window4 as RGB[],
  5: WINDOW_PALETTE_DEFAULTS.window5 as RGB[],
  6: WINDOW_PALETTE_DEFAULTS.window6 as RGB[],
  7: WINDOW_PALETTE_DEFAULTS.window7 as RGB[],
  8: WINDOW_PALETTE_DEFAULTS.window8 as RGB[],
};

const FONT_DEFAULT: RGB = [...DEFAULT_FONT_COLOR] as RGB;

const TOGGLE_DEFAULTS = {
  BatMode: "wait" as const,
  BatSpeed: 3,
  MsgSpeed: 3,
  Command: "window" as const,
  Gauge: "on" as const,
  Sound: "stereo" as const,
  Cursor: "reset" as const,
  Reequip: "optimum" as const,
  SpellOrder: 1,
  Wallpaper: 1,
};

const PAGE_A_OPTIONS: OptionRow[] = [
  { key: "BatMode", y: 44, values: [["active", 112], ["wait", 176]] },
  { key: "BatSpeed", y: 60, values: [1, 2, 3, 4, 5, 6].map((v, i) => [v, 112 + i * 16] as const) },
  { key: "MsgSpeed", y: 76, values: [1, 2, 3, 4, 5, 6].map((v, i) => [v, 112 + i * 16] as const) },
  { key: "Command", y: 92, values: [["window", 112], ["short", 176]] },
  { key: "Gauge", y: 108, values: [["on", 112], ["off", 176]] },
  { key: "Sound", y: 124, values: [["stereo", 112], ["mono", 176]] },
  { key: "Cursor", y: 140, values: [["reset", 112], ["memory", 176]] },
  { key: "Reequip", y: 156, values: [["optimum", 112], ["empty", 176]] },
];

const PAGE_B_OPTIONS: OptionRow[] = [
  { key: "SpellOrder", y: 44, values: [1, 2, 3, 4, 5, 6].map((v, i) => [v, 112 + i * 16] as const) },
  { key: "Wallpaper", y: 108, values: [1, 2, 3, 4, 5, 6, 7, 8].map((v, i) => [v, 112 + i * 16] as const) },
  {
    key: "Color",
    y: 124,
    kind: "color",
    values: [
      ["font", 112, 124] as const,
      ["window", 176, 124] as const,
      ...[1, 2, 3, 4, 5, 6, 7].map((s, i) => [`slot${s}`, 180 + i * 8, 139] as const),
    ],
  },
  { key: "R", y: 154, kind: "slider", channel: 0, cursorX: 112 },
  { key: "G", y: 170, kind: "slider", channel: 1, cursorX: 112 },
  { key: "B", y: 186, kind: "slider", channel: 2, cursorX: 112 },
];

const ASSET_BASE = "/ff6-config-assets";

type WindowAsset = {
  baselineData: ImageData | null;
  slotsData: (ImageData | null)[];
  fontData: ImageData | null;
  defaultA: HTMLImageElement | null;
  defaultB: HTMLImageElement | null;
  correction: number[][] | null;
  baselineDataA: ImageData | null;
  slotsDataA: (ImageData | null)[];
  fontDataA: ImageData | null;
  correctionA: number[][] | null;
};

type AssetCache = {
  manifest: any;
  windowAssets: Record<number, WindowAsset>;
  magOrder: Record<number, ImageData>;
  magOrderBbox: [number, number, number, number] | null;
};

const DIGIT_MASKS: number[][] = [
  [0, 0b01111100, 0b11000110, 0b11000110, 0b11000110, 0b11000110, 0b11000110, 0b01111100, 0, 0],
  [0, 0b00110000, 0b01110000, 0b00110000, 0b00110000, 0b00110000, 0b00110000, 0b01111000, 0, 0],
  [0, 0b01111100, 0b10000110, 0b00000110, 0b00001100, 0b00110000, 0b01100000, 0b11111110, 0, 0],
  [0, 0b11111110, 0b00001100, 0b00011000, 0b00111100, 0b00000110, 0b10000110, 0b01111100, 0, 0],
  [0, 0b00011100, 0b00101100, 0b01001100, 0b10001100, 0b10001100, 0b11111110, 0b00001100, 0, 0],
  [0, 0b11111110, 0b11000000, 0b11111100, 0b00000110, 0b00000110, 0b10000110, 0b01111100, 0, 0],
  [0, 0b00111100, 0b01100000, 0b11000000, 0b11111100, 0b11000110, 0b11000110, 0b01111100, 0, 0],
  [0, 0b11111110, 0b00000110, 0b00000110, 0b00001100, 0b00011000, 0b00110000, 0b00110000, 0, 0],
  [0, 0b01111100, 0b11000110, 0b11000110, 0b01111100, 0b11000110, 0b11000110, 0b01111100, 0, 0],
  [0, 0b01111100, 0b11000110, 0b11000110, 0b01111110, 0b00000110, 0b00001100, 0b01111000, 0, 0],
];
const DIGIT_MASK_W = 8;
const DIGIT_MASK_H = 10;

type WordMask = { w: number; h: number; ipr: number; rows: number[] };

const WORD_MASKS: Record<string, WordMask> = {
  wait: { w: 30, h: 7, ipr: 1, rows: [0xb6003030, 0xb67830fc, 0xb68c0030, 0xb67c3030, 0xb6cc3030, 0xb6cc3030, 0xfc7c301c] },
  window: { w: 47, h: 7, ipr: 2, rows: [0xb630000c, 0x00000000, 0xb630f80c, 0x78b60000, 0xb600cc7c, 0xccb60000, 0xb630cccc, 0xccb60000, 0xb630cccc, 0xccb60000, 0xb630cccc, 0xccb60000, 0xfc30cc7c, 0x78fc0000] },
  on: { w: 14, h: 7, ipr: 1, rows: [0x7c000000, 0xc6f80000, 0xc6cc0000, 0xc6cc0000, 0xc6cc0000, 0xc6cc0000, 0x7ccc0000] },
  stereo: { w: 46, h: 7, ipr: 2, rows: [0x7c300000, 0x00000000, 0xc2fc78dc, 0x78780000, 0xe030cce0, 0xcccc0000, 0x7830fcc0, 0xfccc0000, 0x1c30c0c0, 0xc0cc0000, 0x8e30c4c0, 0xc4cc0000, 0x7c1c78c0, 0x78780000] },
  reset: { w: 38, h: 7, ipr: 2, rows: [0xfc000000, 0x30000000, 0xc6787878, 0xfc000000, 0xc6ccc4cc, 0x30000000, 0xfcfc70fc, 0x30000000, 0xc6c038c0, 0x30000000, 0xc6c48cc4, 0x30000000, 0xc6787878, 0x1c000000] },
  optimum: { w: 55, h: 8, ipr: 2, rows: [0x7c003030, 0x00000000, 0xc6f8fc30, 0xfcccfc00, 0xc6cc3000, 0xb6ccb600, 0xc6cc3030, 0xb6ccb600, 0xc6cc3030, 0xb6ccb600, 0xc6f83030, 0xb6ccb600, 0x7cc01c30, 0xb67cb600, 0x00c00000, 0x00000000] },
  active: { w: 46, h: 7, ipr: 2, rows: [0x7c003030, 0x00000000, 0xc678fc30, 0xcc780000, 0xc6c43000, 0xcccc0000, 0xc6c03030, 0xccfc0000, 0xfec03030, 0xccc00000, 0xc6c43030, 0xc8c40000, 0xc6781c30, 0xf0780000] },
  short: { w: 38, h: 7, ipr: 2, rows: [0x7cc00000, 0x30000000, 0xc2c078dc, 0xfc000000, 0xe0f8cce0, 0x30000000, 0x78ccccc0, 0x30000000, 0x1cccccc0, 0x30000000, 0x8eccccc0, 0x30000000, 0x7ccc78c0, 0x1c000000] },
  off: { w: 22, h: 7, ipr: 1, rows: [0x7c1c1c00, 0xc6303000, 0xc6fcfc00, 0xc6303000, 0xc6303000, 0xc6303000, 0x7c303000] },
  mono: { w: 30, h: 7, ipr: 1, rows: [0x86000000, 0xce78f878, 0xfecccccc, 0xb6cccccc, 0x86cccccc, 0x86cccccc, 0x8678cc78] },
  memory: { w: 46, h: 8, ipr: 2, rows: [0x86000000, 0x00000000, 0xce78fc78, 0xdccc0000, 0xfeccb6cc, 0xe0cc0000, 0xb6fcb6cc, 0xc0cc0000, 0x86c0b6cc, 0xc07c0000, 0x86c4b6cc, 0xc00c0000, 0x8678b678, 0xc08c0000, 0x00000000, 0x00780000] },
  empty: { w: 38, h: 8, ipr: 2, rows: [0xfe000030, 0x00000000, 0xc0fcf8fc, 0xcc000000, 0xc0b6cc30, 0xcc000000, 0xfcb6cc30, 0xcc000000, 0xc0b6cc30, 0x7c000000, 0xc0b6f830, 0x0c000000, 0xfeb6c01c, 0x8c000000, 0x0000c000, 0x78000000] },
  font: { w: 30, h: 7, ipr: 1, rows: [0xfe000030, 0xc078f8fc, 0xc0cccc30, 0xfccccc30, 0xc0cccc30, 0xc0cccc30, 0xc078cc1c] },
};

const SLIDER_ROWS = [
  { y: 154, channel: 0 as const },
  { y: 170, channel: 1 as const },
  { y: 186, channel: 2 as const },
];
const SLIDER_NUM_TENS_X = 128;
const SLIDER_NUM_ONES_X = 137;
const SLIDER_NUM_Y_OFF = 2;
const SLIDER_NUM_ERASE_X = 127;
const SLIDER_NUM_ERASE_W = 18;
const SLIDER_NUM_ERASE_H = 9;
const SLIDER_NUM_ERASE_SRC_X = 80;
const SLIDER_BAR_X0 = 152;
const SLIDER_BAR_W31 = 62;
const SLIDER_BAR_Y_OFF = 5;
const SLIDER_BAR_FILL_H = 3;

const CB = typeof window === "undefined" ? "" : "?v=" + Date.now();

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url + CB;
  });

const toImageData = (img: HTMLImageElement | null): ImageData | null => {
  if (!img) return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 224;
  const cx = c.getContext("2d");
  if (!cx) return null;
  cx.drawImage(img, 0, 0);
  return cx.getImageData(0, 0, 256, 224);
};

const defaultInternalState = (): State => ({
  page: "A",
  BatMode: TOGGLE_DEFAULTS.BatMode,
  BatSpeed: TOGGLE_DEFAULTS.BatSpeed,
  MsgSpeed: TOGGLE_DEFAULTS.MsgSpeed,
  Command: TOGGLE_DEFAULTS.Command,
  Gauge: TOGGLE_DEFAULTS.Gauge,
  Sound: TOGGLE_DEFAULTS.Sound,
  Cursor: TOGGLE_DEFAULTS.Cursor,
  Reequip: TOGGLE_DEFAULTS.Reequip,
  SpellOrder: TOGGLE_DEFAULTS.SpellOrder,
  Wallpaper: TOGGLE_DEFAULTS.Wallpaper,
  font: [...FONT_DEFAULT] as RGB,
  windows: Object.fromEntries(
    Object.entries(WINDOW_DEFAULTS).map(([k, v]) => [k, v.map((c) => [...c] as RGB)])
  ) as Record<number, RGB[]>,
  editing: { kind: "font" },
  cursor: 0,
});

const loadStoredState = (): State => {
  const fresh = defaultInternalState();
  if (typeof window === "undefined") return fresh;
  try {
    const raw = localStorage.getItem("in_game_config");
    if (!raw) return fresh;
    const stored = JSON.parse(raw);
    return {
      ...fresh,
      BatMode: stored.batMode ?? fresh.BatMode,
      BatSpeed: stored.batSpeed ?? fresh.BatSpeed,
      MsgSpeed: stored.msgSpeed ?? fresh.MsgSpeed,
      Command: stored.cmdSet ?? fresh.Command,
      Gauge: stored.gauge ?? fresh.Gauge,
      Sound: stored.sound ?? fresh.Sound,
      Cursor: stored.cursor ?? fresh.Cursor,
      Reequip: stored.reequip ?? fresh.Reequip,
      SpellOrder: stored.spellOrder ?? fresh.SpellOrder,
      Wallpaper: stored.wallpaper ?? fresh.Wallpaper,
      font: (stored.fontColor as RGB) ?? fresh.font,
      windows: fresh.windows
        ? (() => {
            const out = { ...fresh.windows };
            if (stored.windowPalettes) {
              for (let i = 1; i <= 8; i++) {
                const k = `window${i}`;
                if (stored.windowPalettes[k]) out[i] = stored.windowPalettes[k];
              }
            }
            return out;
          })()
        : fresh.windows,
    };
  } catch {
    return fresh;
  }
};

const persistState = (s: State) => {
  if (typeof window === "undefined") return;
  const out = {
    batMode: s.BatMode,
    batSpeed: s.BatSpeed,
    msgSpeed: s.MsgSpeed,
    cmdSet: s.Command,
    gauge: s.Gauge,
    sound: s.Sound,
    cursor: s.Cursor,
    reequip: s.Reequip,
    spellOrder: s.SpellOrder,
    wallpaper: s.Wallpaper,
    fontColor: s.font,
    windowPalettes: Object.fromEntries(
      Object.entries(s.windows).map(([k, v]) => [`window${k}`, v])
    ),
  };
  localStorage.setItem("in_game_config", JSON.stringify(out));
};

const CURSOR_PIXELS = ["X.......", "XX......", "XXX.....", "XXXX....", "XXXX....", "XXX.....", "XX......", "X......."];

const buildCursorSprite = (): HTMLCanvasElement => {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 8;
  const cx = c.getContext("2d");
  if (cx) {
    cx.fillStyle = "#fff";
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) if (CURSOR_PIXELS[y][x] === "X") cx.fillRect(x, y, 1, 1);
  }
  return c;
};

const ARROW_X0 = 121;
const ARROW_DOWN_Y0 = 205;
const ARROW_UP_Y0 = 28;
const ARROW_W = 13;
const ARROW_H = 7;

const buildArrowDownSprite = (): HTMLCanvasElement => {
  const H: [number, number, number] = [24, 24, 41];
  const A: [number, number, number] = [123, 156, 156];
  const B: [number, number, number] = [165, 198, 198];
  const C: [number, number, number] = [247, 255, 255];
  const rows: ([number, number, number] | null)[][] = [
    [H, H, H, H, H, H, H, H, H, H, H, H, H],
    [null, H, A, B, B, B, B, B, B, B, A, H, null],
    [null, null, H, A, B, C, C, C, B, A, H, null, null],
    [null, null, null, H, A, B, C, B, A, H, null, null, null],
    [null, null, null, null, H, A, B, A, H, null, null, null, null],
    [null, null, null, null, null, H, A, H, null, null, null, null, null],
    [null, null, null, null, null, null, H, null, null, null, null, null, null],
  ];
  const c = document.createElement("canvas");
  c.width = ARROW_W;
  c.height = ARROW_H;
  const cx = c.getContext("2d");
  if (!cx) return c;
  const im = cx.createImageData(ARROW_W, ARROW_H);
  for (let y = 0; y < ARROW_H; y++)
    for (let x = 0; x < ARROW_W; x++) {
      const px = rows[y][x];
      const i = (y * ARROW_W + x) * 4;
      if (px) {
        im.data[i] = px[0];
        im.data[i + 1] = px[1];
        im.data[i + 2] = px[2];
        im.data[i + 3] = 255;
      }
    }
  cx.putImageData(im, 0, 0);
  return c;
};

const buildArrowUpSprite = (down: HTMLCanvasElement): HTMLCanvasElement => {
  const c = document.createElement("canvas");
  c.width = ARROW_W;
  c.height = ARROW_H;
  const cx = c.getContext("2d");
  if (!cx) return c;
  cx.translate(0, ARROW_H);
  cx.scale(1, -1);
  cx.drawImage(down, 0, 0);
  return c;
};

const getOptionsForPage = (page: "A" | "B") => (page === "A" ? PAGE_A_OPTIONS : PAGE_B_OPTIONS);

const valuePos = (row: OptionRow, item: ValueItem): { x: number; y: number } => {
  if (row.kind === "slider") return { x: row.cursorX, y: row.y };
  const x = item[1] as number;
  const yOverride = item[2] as number | undefined;
  return { x, y: yOverride ?? row.y };
};

const editedRgb = (s: State): RGB => {
  if (s.editing.kind === "font") return s.font;
  const slot = s.editing.kind === "window" ? 1 : s.editing.slot;
  return s.windows[s.Wallpaper][slot - 1];
};

const currentValueOf = (row: OptionRow, s: State): string | number => {
  if (row.kind === "color") {
    if (s.editing.kind === "font") return "font";
    if (s.editing.kind === "window") return "window";
    return `slot${s.editing.slot}`;
  }
  if (row.kind === "slider") return editedRgb(s)[row.channel];
  return (s as any)[row.key];
};

const activeValueIndex = (row: OptionRow, s: State): number => {
  if (row.kind === "slider") return 0;
  const cur = currentValueOf(row, s);
  const i = row.values.findIndex(([v]) => v === cur);
  return i < 0 ? 0 : i;
};

const approxValueWidth = (row: OptionRow, v: string | number): number => {
  if (row.kind === "color") {
    if (v === "font") return 22;
    if (v === "window") return 38;
    return 4; // slots
  }
  if (typeof v === "number") return 8;
  return Math.min(56, String(v).length * 7 + 4);
};

export const InGameConfigCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const arrowDownRef = useRef<HTMLCanvasElement | null>(null);
  const arrowUpRef = useRef<HTMLCanvasElement | null>(null);
  const assetsRef = useRef<AssetCache>({
    manifest: null,
    windowAssets: {},
    magOrder: {},
    magOrderBbox: null,
  });

  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  const [state, setStateRaw] = useState<State>(defaultInternalState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setState = useCallback((updater: (s: State) => State) => {
    setStateRaw((prev) => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, []);

  // Load saved state on mount (client only).
  useEffect(() => {
    setStateRaw(loadStoredState());
  }, []);

  // Load assets on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let manifest = globalManifest;
        if (!manifest) {
          manifest = await fetch(`${ASSET_BASE}/manifest.json${CB}`).then((r) => r.json());
          globalManifest = manifest;
        }
        assetsRef.current.manifest = manifest;
        cursorSpriteRef.current = buildCursorSprite();
        arrowDownRef.current = buildArrowDownSprite();
        arrowUpRef.current = buildArrowUpSprite(arrowDownRef.current);

        // Preload active window first.
        const activeWin = stateRef.current.Wallpaper;
        await loadWindowAssetsInto(assetsRef.current, activeWin);

        // Load remaining windows in parallel.
        const others = Object.keys(manifest.windows || {})
          .map((k) => parseInt(k, 10))
          .filter((n) => n !== activeWin);
        await Promise.all(others.map((n) => loadWindowAssetsInto(assetsRef.current, n)));

        // Load magorder overlays.
        await loadMagOrderOverlays(assetsRef.current);

        if (!cancelled) setReady(true);
      } catch (e) {
        console.error("InGameConfigCard asset load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-render canvas whenever state changes.
  useEffect(() => {
    if (!ready) return;
    renderCanvas(
      canvasRef.current,
      cursorSpriteRef.current,
      arrowDownRef.current,
      arrowUpRef.current,
      assetsRef.current,
      state
    );
  }, [state, ready]);

  // Keyboard handling — attach to canvas (focused element).
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") {
        e.preventDefault();
        move(-1, 0);
        return;
      }
      if (k === "arrowdown" || k === "s") {
        e.preventDefault();
        move(1, 0);
        return;
      }
      if (k === "arrowleft" || k === "a") {
        e.preventDefault();
        move(0, -1);
        return;
      }
      if (k === "arrowright" || k === "d") {
        e.preventDefault();
        move(0, 1);
        return;
      }
      if (k === "enter" || k === " ") {
        e.preventDefault();
        selectCurrent();
        return;
      }
      if (k === "tab") {
        e.preventDefault();
        setState((s) => ({ ...s, page: s.page === "A" ? "B" : "A", cursor: 0 }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const move = useCallback(
    (dRow: number, dCol: number) => {
      setState((s) => {
        let next: State = s;
        if (dRow !== 0) {
          const opts = getOptionsForPage(next.page);
          const cand = next.cursor + dRow;
          if (cand < 0) {
            const otherPage = next.page === "A" ? "B" : "A";
            const otherOpts = getOptionsForPage(otherPage);
            next = { ...next, page: otherPage, cursor: otherOpts.length - 1 };
          } else if (cand >= opts.length) {
            const otherPage = next.page === "A" ? "B" : "A";
            next = { ...next, page: otherPage, cursor: 0 };
          } else {
            next = { ...next, cursor: cand };
          }
        }
        if (dCol !== 0) {
          const opts = getOptionsForPage(next.page);
          const row = opts[next.cursor];
          if (row.kind === "slider") {
            const rgb = [...editedRgb(next)] as RGB;
            rgb[row.channel] = Math.max(0, Math.min(31, rgb[row.channel] + dCol));
            next = writeEditedRgb(next, rgb);
          } else {
            const cur = activeValueIndex(row, next);
            const ni = (cur + dCol + row.values.length) % row.values.length;
            const val = row.values[ni][0];
            next = applyValueSelection(next, row, val);
          }
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const startRepeat = (dRow: number, dCol: number) => {
    stopRepeat();
    move(dRow, dCol);
    canvasRef.current?.focus();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        move(dRow, dCol);
      }, 80);
    }, 600);
  };

  const stopRepeat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const selectCurrent = useCallback(() => {
    setState((s) => {
      const opts = getOptionsForPage(s.page);
      const row = opts[s.cursor];
      if (row.kind === "slider") return s;
      const idx = activeValueIndex(row, s);
      const val = row.values[idx][0];
      return applyValueSelection(s, row, val);
    });
  }, [setState]);

  const updateSliderValue = (clientX: number, rect: DOMRect, rowIdx: number, channel: 0 | 1 | 2) => {
    const relativeClick = (clientX - rect.left) / rect.width;
    const xCanvas = (SLIDER_BAR_X0 - 4) + relativeClick * (SLIDER_BAR_W31 + 8);
    const t = (xCanvas - SLIDER_BAR_X0) / SLIDER_BAR_W31;
    const v = Math.round(Math.max(0, Math.min(1, t)) * 31);
    setState((s) => {
      const rgb = [...editedRgb(s)] as RGB;
      rgb[channel] = v;
      return { ...writeEditedRgb(s, rgb), cursor: rowIdx };
    });
  };

  const handleSliderMouseDown = (
    e: React.MouseEvent<HTMLButtonElement>,
    rowIdx: number,
    channel: 0 | 1 | 2
  ) => {
    if (e.button !== 0) return; // only left click
    e.preventDefault();
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();

    updateSliderValue(e.clientX, rect, rowIdx, channel);
    canvasRef.current?.focus();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateSliderValue(moveEvent.clientX, rect, rowIdx, channel);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSliderTouchStart = (
    e: React.TouchEvent<HTMLButtonElement>,
    rowIdx: number,
    channel: 0 | 1 | 2
  ) => {
    e.preventDefault();
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const touch = e.touches[0];

    updateSliderValue(touch.clientX, rect, rowIdx, channel);
    canvasRef.current?.focus();

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        updateSliderValue(moveEvent.touches[0].clientX, rect, rowIdx, channel);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleHitClick = (rowIdx: number, val: string | number) => {
    setState((s) => {
      const opts = getOptionsForPage(s.page);
      const row = opts[rowIdx];
      const after = applyValueSelection(s, row, val);
      return { ...after, cursor: rowIdx };
    });
    canvasRef.current?.focus();
  };
  const opts = getOptionsForPage(state.page);

  return (
    <Card title="In-Game Configurations">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Customize system preferences, spell sortings, and window styles that will automatically be
          patched directly into your ROM when downloaded.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed -mt-2">
          Arrow keys / WASD = move cursor &middot; Enter / Space = toggle &middot; Tab = switch page
          &middot; Click options directly with the mouse.
        </p>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex justify-between items-center w-full max-w-[768px] gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                size="small"
                variant={state.page === "A" ? "primary" : "default"}
                style={state.page === "A" ? { border: "1px solid transparent" } : undefined}
                onClick={() => setState((s) => ({ ...s, page: "A", cursor: 0 }))}
              >
                Page A
              </Button>
              <Button
                type="button"
                size="small"
                variant={state.page === "B" ? "primary" : "default"}
                style={state.page === "B" ? { border: "1px solid transparent" } : undefined}
                onClick={() => setState((s) => ({ ...s, page: "B", cursor: 0 }))}
              >
                Page B
              </Button>
            </div>
            <Button
              type="button"
              size="small"
              variant="default"
              onClick={() => {
                setState(() => {
                  const fresh = defaultInternalState();
                  return fresh;
                });
              }}
            >
              Restore Defaults
            </Button>
          </div>

          <div
            className="relative w-full max-w-[768px] aspect-[256/224] border-2 border-slate-600 focus-within:border-emerald-500 outline-none bg-black overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              width={256}
              height={224}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full outline-none"
              style={{
                imageRendering: "pixelated",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
            >
              {opts.map((row, rIdx) => {
                if (row.kind === "slider") {
                  return (
                    <button
                      key={`slider-${rIdx}`}
                      type="button"
                      onMouseDown={(e) => handleSliderMouseDown(e, rIdx, row.channel)}
                      onTouchStart={(e) => handleSliderTouchStart(e, rIdx, row.channel)}
                      title={`${row.key}: click and drag to set`}
                      className="absolute pointer-events-auto cursor-pointer hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40"
                      style={{
                        left: `${((SLIDER_BAR_X0 - 4) / 256) * 100}%`,
                        top: `${((row.y + 3) / 224) * 100}%`,
                        width: `${((SLIDER_BAR_W31 + 8) / 256) * 100}%`,
                        height: `${(7 / 224) * 100}%`,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                      }}
                    />
                  );
                }
                return row.values.map((item, vIdx) => {
                  const val = item[0];
                  const { x, y } = valuePos(row, item);
                  const w = approxValueWidth(row, val);
                  return (
                    <button
                      key={`${rIdx}-${vIdx}`}
                      type="button"
                      onClick={() => handleHitClick(rIdx, val)}
                      title={`${row.key}: ${val}`}
                      className="absolute pointer-events-auto cursor-pointer hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40"
                      style={{
                        left: `${((x - 2) / 256) * 100}%`,
                        top: `${(y / 224) * 100}%`,
                        width: `${((w + 4) / 256) * 100}%`,
                        height: `${(12 / 224) * 100}%`,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                      }}
                    />
                  );
                });
              })}
              <button
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, page: s.page === "A" ? "B" : "A", cursor: 0 }))
                }
                title={state.page === "A" ? "Go to Page B" : "Go to Page A"}
                className="absolute pointer-events-auto cursor-pointer hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40"
                style={{
                  left: `${((ARROW_X0 - 3) / 256) * 100}%`,
                  top: `${(((state.page === "A" ? ARROW_DOWN_Y0 : ARROW_UP_Y0) - 2) / 224) * 100}%`,
                  width: `${((ARROW_W + 6) / 256) * 100}%`,
                  height: `${((ARROW_H + 4) / 224) * 100}%`,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              />
            </div>
          </div>

          {/* D-pad Controller for Mobile Only */}
          <div className="flex flex-col items-center mt-4 md:hidden w-full max-w-[280px]">
            <div className="relative w-36 h-36 bg-slate-900 rounded-full border border-slate-700/80 shadow-lg flex items-center justify-center">
              <div className="grid grid-cols-3 grid-rows-3 w-28 h-28 items-center justify-items-center">
                {/* Row 1 */}
                <div></div>
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); startRepeat(-1, 0); }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="w-9 h-10 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:text-white border-t border-x border-slate-600 rounded-t-md shadow-md text-slate-400 flex items-center justify-center transition-all transform active:scale-95 cursor-pointer outline-none select-none"
                  title="Move Up"
                >
                  <FaCaretUp size={20} />
                </button>
                <div></div>

                {/* Row 2 */}
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); startRepeat(0, -1); }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="w-10 h-9 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:text-white border-y border-l border-slate-600 rounded-l-md shadow-md text-slate-400 flex items-center justify-center transition-all transform active:scale-95 cursor-pointer outline-none select-none"
                  title="Decrease / Previous"
                >
                  <FaCaretLeft size={20} />
                </button>
                <div className="w-9 h-9 bg-slate-800 border border-slate-700 shadow-inner flex items-center justify-center text-slate-600 select-none">
                  <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
                </div>
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); startRepeat(0, 1); }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="w-10 h-9 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:text-white border-y border-r border-slate-600 rounded-r-md shadow-md text-slate-400 flex items-center justify-center transition-all transform active:scale-95 cursor-pointer outline-none select-none"
                  title="Increase / Next"
                >
                  <FaCaretRight size={20} />
                </button>

                {/* Row 3 */}
                <div></div>
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); startRepeat(1, 0); }}
                  onPointerUp={stopRepeat}
                  onPointerLeave={stopRepeat}
                  onPointerCancel={stopRepeat}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="w-9 h-10 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:text-white border-b border-x border-slate-600 rounded-b-md shadow-md text-slate-400 flex items-center justify-center transition-all transform active:scale-95 cursor-pointer outline-none select-none"
                  title="Move Down"
                >
                  <FaCaretDown size={20} />
                </button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ---- helpers below ----

function writeEditedRgb(s: State, rgb: RGB): State {
  if (s.editing.kind === "font") {
    return { ...s, font: rgb };
  }
  const slot = s.editing.kind === "window" ? 1 : s.editing.slot;
  const win = s.Wallpaper;
  const palette = s.windows[win].map((c, i) => (i === slot - 1 ? rgb : c));
  return { ...s, windows: { ...s.windows, [win]: palette } };
}

function applyValueSelection(s: State, row: OptionRow, val: string | number): State {
  if (row.kind === "color") {
    if (val === "font") return { ...s, editing: { kind: "font" } };
    if (val === "window") return { ...s, editing: { kind: "window" } };
    const slot = parseInt(String(val).slice(4), 10);
    return { ...s, editing: { kind: "slot", slot: isNaN(slot) ? 1 : slot } };
  }
  return { ...s, [row.key]: val } as State;
}

let globalManifest: any = null;
const globalWindowAssets: Record<number, WindowAsset> = {};
const loadingPromises: Record<number, Promise<void> | undefined> = {};
const globalMagOrder: Record<number, ImageData> = {};
let globalMagOrderBbox: [number, number, number, number] | null = null;

async function loadWindowAssetsInto(cache: AssetCache, n: number) {
  if (globalWindowAssets[n]) {
    cache.windowAssets[n] = globalWindowAssets[n];
    return;
  }
  if (loadingPromises[n]) {
    await loadingPromises[n];
    if (globalWindowAssets[n]) {
      cache.windowAssets[n] = globalWindowAssets[n];
    }
    return;
  }

  loadingPromises[n] = (async () => {
    const info = cache.manifest?.windows?.[String(n)];
    if (!info) return;
    const base = `${ASSET_BASE}/W${n}/`;
    const pageA = info.pageA || null;
    const slotPaths = (suffix: string, present: number[] | null) => {
      const out: Promise<HTMLImageElement | null>[] = [];
      for (let s = 1; s <= 7; s++) {
        out.push(
          present && present.includes(s)
            ? loadImage(`${base}slot${s}${suffix}.png`)
            : Promise.resolve(null)
        );
      }
      return out;
    };
    const promises: Promise<any>[] = [
      loadImage(base + "baseline.png"),
      ...slotPaths("", info.slots),
      info.font ? loadImage(base + "font.png") : Promise.resolve(null),
      info.hasDefaultA ? loadImage(base + "defaultA.png") : Promise.resolve(null),
      info.hasDefaultB ? loadImage(base + "defaultB.png") : Promise.resolve(null),
      info.hasCorrection ? fetch(base + "correction.json" + CB).then((r) => r.json()) : Promise.resolve(null),
      pageA ? loadImage(base + "baselineA.png") : Promise.resolve(null),
      ...slotPaths("A", pageA ? pageA.slots : null),
      pageA && pageA.font ? loadImage(base + "fontA.png") : Promise.resolve(null),
      pageA && pageA.hasCorrection
        ? fetch(base + "correctionA.json" + CB).then((r) => r.json())
        : Promise.resolve(null),
    ];

    const imgs = await Promise.all(promises);
    const asset: WindowAsset = {
      baselineData: toImageData(imgs[0]),
      slotsData: imgs.slice(1, 8).map(toImageData),
      fontData: toImageData(imgs[8]),
      defaultA: imgs[9],
      defaultB: imgs[10],
      correction: imgs[11],
      baselineDataA: toImageData(imgs[12]),
      slotsDataA: imgs.slice(13, 20).map(toImageData),
      fontDataA: toImageData(imgs[20]),
      correctionA: imgs[21],
    };
    if (!asset.fontData) {
      for (const k of Object.keys(cache.manifest.windows || {})) {
        const inf = cache.manifest.windows[k];
        if (inf.font) {
          const otherN = parseInt(k, 10);
          if (otherN !== n) {
            await loadWindowAssetsInto(cache, otherN);
            asset.fontData = globalWindowAssets[otherN]?.fontData || null;
          }
          break;
        }
      }
    }
    globalWindowAssets[n] = asset;
    cache.windowAssets[n] = asset;
  })();

  await loadingPromises[n];
}

async function loadMagOrderOverlays(cache: AssetCache) {
  const info = cache.manifest?.magOrder;
  if (!info) return;

  if (globalMagOrderBbox) {
    cache.magOrderBbox = globalMagOrderBbox;
    cache.magOrder = globalMagOrder;
    return;
  }

  globalMagOrderBbox = info.bbox;
  cache.magOrderBbox = info.bbox;
  const [x0, y0, x1, y1] = info.bbox;
  const w = x1 - x0,
    h = y1 - y0;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext("2d");
  if (!tctx) return;
  for (const n of info.presets) {
    try {
      const img = await loadImage(`${ASSET_BASE}/magorder/${n}.png`);
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(img, 0, 0);
      globalMagOrder[n] = tctx.getImageData(0, 0, w, h);
    } catch (e) {
      console.warn(`MagOrder preset ${n} failed`, e);
    }
  }
  cache.magOrder = globalMagOrder;
}

function renderCanvas(
  canvas: HTMLCanvasElement | null,
  cursorSprite: HTMLCanvasElement | null,
  arrowDown: HTMLCanvasElement | null,
  arrowUp: HTMLCanvasElement | null,
  cache: AssetCache,
  state: State
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const asset = cache.windowAssets[state.Wallpaper];

  if (asset) {
    const data = recolor(ctx, asset, state);
    if (data) ctx.putImageData(data, 0, 0);
    if (state.page === "A" && !asset.baselineDataA && asset.defaultA) {
      ctx.drawImage(asset.defaultA, 0, 0);
      drawPaletteHintBar(ctx);
    }
  } else {
    drawPlaceholder(ctx, state.Wallpaper);
  }

  if (state.page === "B") {
    drawMagOrderText(ctx, cache, state);
    drawColorEditValues(ctx, state);
  }
  drawPageSwitchArrow(ctx, arrowDown, arrowUp, state);
  highlightValueText(ctx, state);
  drawCursorOverlay(ctx, cursorSprite, state);
  drawSelectionOverlay(ctx, state);
}

function recolor(ctx: CanvasRenderingContext2D, asset: WindowAsset, state: State): ImageData | null {
  if (!asset.baselineData) return null;
  const useA = state.page === "A" && !!asset.baselineDataA;
  const baselineData = useA ? asset.baselineDataA! : asset.baselineData;
  const slotsData = useA ? asset.slotsDataA : asset.slotsData;
  const fontData = useA ? asset.fontDataA : asset.fontData;
  const correction = useA ? asset.correctionA : asset.correction;

  const W = 256,
    H = 224;
  const out = ctx.createImageData(W, H);
  const N = W * H * 4;
  const base = baselineData.data;

  const slotColors = state.windows[state.Wallpaper];
  const fontColor = state.font;

  let wBaseR = 1,
    wBaseG = 1,
    wBaseB = 1;
  for (let s = 0; s < 7; s++) {
    if (!slotsData[s]) continue;
    const c = slotColors[s];
    wBaseR -= c[0] / 31;
    wBaseG -= c[1] / 31;
    wBaseB -= c[2] / 31;
  }
  if (fontData) {
    wBaseR -= fontColor[0] / 31;
    wBaseG -= fontColor[1] / 31;
    wBaseB -= fontColor[2] / 31;
  }

  const acc = new Float32Array(N);
  for (let i = 0; i < N; i += 4) {
    acc[i] = base[i] * wBaseR;
    acc[i + 1] = base[i + 1] * wBaseG;
    acc[i + 2] = base[i + 2] * wBaseB;
  }
  for (let s = 0; s < 7; s++) {
    const sd = slotsData[s];
    if (!sd) continue;
    const c = slotColors[s];
    const rs = c[0] / 31,
      gs = c[1] / 31,
      bs = c[2] / 31;
    if (rs === 0 && gs === 0 && bs === 0) continue;
    const d = sd.data;
    for (let i = 0; i < N; i += 4) {
      acc[i] += d[i] * rs;
      acc[i + 1] += d[i + 1] * gs;
      acc[i + 2] += d[i + 2] * bs;
    }
  }
  if (fontData) {
    const c = fontColor;
    const rs = c[0] / 31,
      gs = c[1] / 31,
      bs = c[2] / 31;
    const d = fontData.data;
    for (let i = 0; i < N; i += 4) {
      acc[i] += d[i] * rs;
      acc[i + 1] += d[i + 1] * gs;
      acc[i + 2] += d[i + 2] * bs;
    }
  }
  if (correction) {
    const corr = correction;
    for (let y = 0; y < H; y++) {
      const cr = corr[y][0],
        cg = corr[y][1],
        cb = corr[y][2];
      const row = y * W * 4;
      for (let x = 0; x < W; x++) {
        const i = row + x * 4;
        acc[i] += cr;
        acc[i + 1] += cg;
        acc[i + 2] += cb;
      }
    }
  }

  for (let i = 0; i < N; i += 4) {
    out.data[i] = acc[i];
    out.data[i + 1] = acc[i + 1];
    out.data[i + 2] = acc[i + 2];
    out.data[i + 3] = 255;
  }
  return out;
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, wallpaper: number) {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, 256, 224);
  ctx.fillStyle = "#fc8";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`Loading preview for Window ${wallpaper}…`, 128, 112);
  ctx.textAlign = "start";
}

function drawPaletteHintBar(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 210, 256, 14);
  ctx.fillStyle = "#bcd";
  ctx.font = "9px monospace";
  ctx.fillText("(live recolor preview is on Page B)", 4, 220);
  ctx.restore();
}

function drawMagOrderText(ctx: CanvasRenderingContext2D, cache: AssetCache, state: State) {
  const n = state.SpellOrder;
  const img = cache.magOrder[n];
  if (!img || !cache.magOrderBbox) return;

  const [x0, y0, x1, y1] = cache.magOrderBbox;
  const w = x1 - x0,
    h = y1 - y0;
  const TILE = 32;
  if (x0 - TILE < 0) return;

  const ext = ctx.getImageData(x0 - TILE, y0, w + TILE, h);
  const d = ext.data;
  const W_EXT = w + TILE;
  for (let y = 0; y < h; y++) {
    const row = y * W_EXT * 4;
    for (let x = TILE; x < W_EXT; x++) {
      const off = row + x * 4;
      const src = off - TILE * 4;
      d[off] = d[src];
      d[off + 1] = d[src + 1];
      d[off + 2] = d[src + 2];
    }
  }
  ctx.putImageData(ext, x0 - TILE, y0);

  const TEXT_THRESHOLD = 70;
  const DARK_THRESHOLD = 10;
  const fr = (state.font[0] * 255) / 31;
  const fg = (state.font[1] * 255) / 31;
  const fb = (state.font[2] * 255) / 31;
  const region = ctx.getImageData(x0, y0, w, h);
  const rd = region.data,
    md = img.data;
  const stride = w * 4;
  for (let py = 0; py < h - 1; py++) {
    for (let px = 0; px < w - 1; px++) {
      const i = py * stride + px * 4;
      const mx = Math.max(md[i], md[i + 1], md[i + 2]);
      if (mx > TEXT_THRESHOLD) {
        const sh = i + stride + 4;
        rd[sh] = 0;
        rd[sh + 1] = 0;
        rd[sh + 2] = 0;
      }
    }
  }
  for (let i = 0; i < rd.length; i += 4) {
    const mx = Math.max(md[i], md[i + 1], md[i + 2]);
    if (mx < DARK_THRESHOLD) {
      rd[i] = 0;
      rd[i + 1] = 0;
      rd[i + 2] = 0;
    }
  }
  for (let i = 0; i < rd.length; i += 4) {
    const mx = Math.max(md[i], md[i + 1], md[i + 2]);
    if (mx > TEXT_THRESHOLD) {
      const t = mx / 255;
      rd[i] = Math.round(fr * t);
      rd[i + 1] = Math.round(fg * t);
      rd[i + 2] = Math.round(fb * t);
    }
  }
  ctx.putImageData(region, x0, y0);
}

function drawColorEditValues(ctx: CanvasRenderingContext2D, state: State) {
  const rgb = editedRgb(state);
  const fr = Math.round((state.font[0] * 255) / 31);
  const fg = Math.round((state.font[1] * 255) / 31);
  const fb = Math.round((state.font[2] * 255) / 31);
  const fontCss = `rgb(${fr}, ${fg}, ${fb})`;
  for (const row of SLIDER_ROWS) {
    redrawNumber(ctx, row.y, rgb[row.channel], fontCss);
    redrawBarFill(ctx, row.y, rgb[row.channel], fontCss);
  }
}

function redrawNumber(ctx: CanvasRenderingContext2D, rowY: number, value: number, fontCss: string) {
  const yTop = rowY + SLIDER_NUM_Y_OFF;
  const src = ctx.getImageData(SLIDER_NUM_ERASE_SRC_X, yTop, SLIDER_NUM_ERASE_W, SLIDER_NUM_ERASE_H);
  ctx.putImageData(src, SLIDER_NUM_ERASE_X, yTop);
  if (value >= 10) drawDigit(ctx, SLIDER_NUM_TENS_X, yTop, Math.floor(value / 10), fontCss);
  drawDigit(ctx, SLIDER_NUM_ONES_X, yTop, value % 10, fontCss);
}

function drawDigit(ctx: CanvasRenderingContext2D, x: number, y: number, digit: number, fillCss: string) {
  const mask = DIGIT_MASKS[digit];
  if (!mask) return;
  ctx.fillStyle = "#000000";
  for (let dy = 0; dy < DIGIT_MASK_H; dy++) {
    const py = y + dy - 1;
    if (py + 1 < 0 || py + 1 >= 224) continue;
    const bits = mask[dy];
    if (!bits) continue;
    for (let dx = 0; dx < DIGIT_MASK_W; dx++) {
      const px = x + dx;
      if (px + 1 < 0 || px + 1 >= 256) continue;
      if (bits & (1 << (DIGIT_MASK_W - 1 - dx))) ctx.fillRect(px + 1, py + 1, 1, 1);
    }
  }
  ctx.fillStyle = fillCss;
  for (let dy = 0; dy < DIGIT_MASK_H; dy++) {
    const py = y + dy - 1;
    if (py < 0 || py >= 224) continue;
    const bits = mask[dy];
    if (!bits) continue;
    for (let dx = 0; dx < DIGIT_MASK_W; dx++) {
      const px = x + dx;
      if (px < 0 || px >= 256) continue;
      if (bits & (1 << (DIGIT_MASK_W - 1 - dx))) ctx.fillRect(px, py, 1, 1);
    }
  }
}

function redrawBarFill(ctx: CanvasRenderingContext2D, rowY: number, value: number, fontCss: string) {
  const fillW = Math.round((value * SLIDER_BAR_W31) / 31);
  if (fillW <= 0) return;
  ctx.fillStyle = fontCss;
  for (let i = 0; i < SLIDER_BAR_FILL_H; i++) {
    ctx.fillRect(SLIDER_BAR_X0, rowY + SLIDER_BAR_Y_OFF + i, fillW, 1);
  }
}

function stampWordHighlight(
  d: Uint8ClampedArray,
  word: string,
  x: number,
  y: number,
  color: [number, number, number]
) {
  const m = WORD_MASKS[word];
  if (!m) return;
  const W = 256,
    H = 224;
  for (let dy = 0; dy < m.h; dy++) {
    const py = y + dy;
    if (py < 0 || py >= H) continue;
    for (let dx = 0; dx < m.w; dx++) {
      const px = x + dx;
      if (px < 0 || px >= W) continue;
      const intIdx = dx >> 5;
      const bitIdx = 31 - (dx & 31);
      const word32 = m.rows[dy * m.ipr + intIdx];
      if (word32 & (1 << bitIdx)) {
        const i = (py * W + px) * 4;
        d[i] = color[0];
        d[i + 1] = color[1];
        d[i + 2] = color[2];
      }
    }
  }
}

function highlightValueText(ctx: CanvasRenderingContext2D, state: State) {
  const opts = getOptionsForPage(state.page);
  if (!opts.length) return;
  const W = 256,
    H = 224;
  const data = ctx.getImageData(0, 0, W, H);
  const d = data.data;
  const TEXT_THRESHOLD = 80;
  const BRIGHT_TARGET = 255;
  const DIM_TARGET = 128;

  const BRIGHT_COLOR: [number, number, number] = [
    Math.round((state.font[0] * 255) / 31),
    Math.round((state.font[1] * 255) / 31),
    Math.round((state.font[2] * 255) / 31),
  ];
  const DIM_COLOR: [number, number, number] = [DIM_TARGET, DIM_TARGET, DIM_TARGET];

  const adjustPixel = (i: number, target: number) => {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    const m = Math.max(r, g, b);
    if (m <= TEXT_THRESHOLD) return;
    const scale = target / m;
    d[i] = Math.min(255, r * scale);
    d[i + 1] = Math.min(255, g * scale);
    d[i + 2] = Math.min(255, b * scale);
  };

  const stampGlyphPixel = (i: number, color: [number, number, number]) => {
    d[i] = color[0];
    d[i + 1] = color[1];
    d[i + 2] = color[2];
  };

  for (const row of opts) {
    if (row.kind === "slider") continue;
    if (row.kind === "color") {
      const fontBright = state.editing.kind === "font";
      stampWordHighlight(d, "font", 112, 124, fontBright ? BRIGHT_COLOR : DIM_COLOR);
      stampWordHighlight(d, "window", 176, 124, fontBright ? DIM_COLOR : BRIGHT_COLOR);
      continue;
    }
    const cur = currentValueOf(row, state);
    for (const item of row.values) {
      const val = item[0];
      const { x, y } = valuePos(row, item);
      const color: [number, number, number] = val === cur ? BRIGHT_COLOR : DIM_COLOR;
      const target = val === cur ? BRIGHT_TARGET : DIM_TARGET;

      if (typeof val === "number" && val >= 0 && val < DIGIT_MASKS.length) {
        const mask = DIGIT_MASKS[val];
        for (let dy = 0; dy < DIGIT_MASK_H; dy++) {
          const py = y + dy - 1;
          if (py < 0 || py >= H) continue;
          const bits = mask[dy];
          if (!bits) continue;
          for (let dx = 0; dx < DIGIT_MASK_W; dx++) {
            const px = x + dx;
            if (px < 0 || px >= W) continue;
            if (bits & (1 << (DIGIT_MASK_W - 1 - dx))) {
              stampGlyphPixel((py * W + px) * 4, color);
            }
          }
        }
      } else if (typeof val === "string" && WORD_MASKS[val]) {
        const m = WORD_MASKS[val];
        for (let dy = 0; dy < m.h; dy++) {
          const py = y + dy;
          if (py < 0 || py >= H) continue;
          for (let dx = 0; dx < m.w; dx++) {
            const px = x + dx;
            if (px < 0 || px >= W) continue;
            const intIdx = dx >> 5;
            const bitIdx = 31 - (dx & 31);
            const word = m.rows[dy * m.ipr + intIdx];
            if (word & (1 << bitIdx)) {
              stampGlyphPixel((py * W + px) * 4, color);
            }
          }
        }
      } else {
        const w = approxValueWidth(row, val);
        const h = 9;
        for (let py = y; py < y + h && py < H; py++) {
          for (let px = x; px < x + w && px < W; px++) {
            adjustPixel((py * W + px) * 4, target);
          }
        }
      }
    }
  }
  ctx.putImageData(data, 0, 0);
}

function drawPageSwitchArrow(
  ctx: CanvasRenderingContext2D,
  arrowDown: HTMLCanvasElement | null,
  arrowUp: HTMLCanvasElement | null,
  state: State
) {
  if (state.page === "A") {
    if (arrowDown) ctx.drawImage(arrowDown, ARROW_X0, ARROW_DOWN_Y0);
  } else {
    if (arrowUp) ctx.drawImage(arrowUp, ARROW_X0, ARROW_UP_Y0);
  }
}

function drawCursorOverlay(
  ctx: CanvasRenderingContext2D,
  cursorSprite: HTMLCanvasElement | null,
  state: State
) {
  if (!cursorSprite) return;
  const opts = getOptionsForPage(state.page);
  const row = opts[state.cursor];
  if (!row) return;
  let cx: number, cy: number;
  if (row.kind === "slider") {
    cx = row.cursorX;
    cy = row.y;
  } else {
    const idx = activeValueIndex(row, state);
    const item = row.values[idx];
    if (!item) return;
    ({ x: cx, y: cy } = valuePos(row, item));
  }
  ctx.save();
  ctx.drawImage(cursorSprite, cx - 10, cy + 1);
  ctx.restore();
}

function drawSelectionOverlay(ctx: CanvasRenderingContext2D, state: State) {
  const opts = getOptionsForPage(state.page);
  ctx.save();
  ctx.fillStyle = "rgba(255, 240, 120, 0.85)";
  for (const row of opts) {
    if (row.kind === "slider") continue;
    const cur = currentValueOf(row, state);
    const item = row.values.find(([v]) => v === cur);
    if (!item) continue;
    const { x, y } = valuePos(row, item);
    const w = approxValueWidth(row, item[0]);
    ctx.fillRect(x, y + 10, w, 1);
  }
  ctx.restore();
}
