import {
  DEFAULT_IN_GAME_CONFIG,
  WINDOW_PALETTE_DEFAULTS,
  FONT_PALETTE_DEFAULTS,
} from "~/types/inGameConfig";

const headerSize = 0x200;
const originalSize = 3145728;
const headeredSize = headerSize + originalSize;
const validHash =
  "0f51b4fca41b7fd509e4b8f9d543151f68efa5e97b08493e4b2a0c06f5d8d5e2";

type BufferType = Uint8Array | Buffer;

export function removeHeader(rom: BufferType) {
  if (rom.length === headeredSize) {
    return rom.slice(headerSize);
  }
  return rom;
}

export async function isValidROM(rom: BufferType) {
  if (rom.length !== originalSize) {
    return {
      success: false,
      message: `Invalid ROM size. Please upload an uncompressed US version 1.0 ROM file. Expected ${originalSize} and received ${rom.length}.`,
    };
  }

  let romHashData = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", rom)),
  );
  let romHashHex = romHashData
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  if (romHashHex !== validHash) {
    return {
      success: false,
      message:
        "Invalid ROM hash. Please upload an uncompressed US version 1.0 ROM file",
    };
  }
  return {
    success: true,
    message: "",
  };
}

/**
 * In-place patches a decrypted ROM Uint8Array with user's preferred system configurations.
 * Translated directly from the repository's original python utility implementation.
 */
export function applyInGameConfig(patchedInput: Uint8Array | ArrayBuffer) {
  if (typeof window === "undefined") return;

  // Ensure we are working with a Uint8Array view
  const patched = patchedInput instanceof Uint8Array ? patchedInput : new Uint8Array(patchedInput);

  const saved = localStorage.getItem("in_game_config");
  let config = DEFAULT_IN_GAME_CONFIG;
  if (saved) {
    try {
      config = { ...DEFAULT_IN_GAME_CONFIG, ...JSON.parse(saved) };
      console.log("[applyInGameConfig] Loaded config from localStorage:", config);
    } catch (e) {
      console.error("[applyInGameConfig] Failed to parse config:", e);
    }
  } else {
    console.warn("[applyInGameConfig] No saved config found, using defaults.");
  }

  // Verification: Check if WorldsCollide Trampoline is installed
  // We look for two JSR ABS instructions (0x20) in sequence.
  const checkTrampoline = (offset: number) => 
    patched[offset] === 0x20 && patched[offset + 3] === 0x20;

  let trampolineOffset = 0x0370c2;
  let isTrampolineInstalled = checkTrampoline(trampolineOffset);
  
  if (!isTrampolineInstalled) {
    console.warn(`[applyInGameConfig] Trampoline not at 0x370C2. Scanning ROM for pattern... (ROM Size: ${patched.length} bytes)`);
    // Deep scan: Look for the pattern 20 ?? ?? 20 ?? ?? within a reasonable range
    // Most WC hooks stay within bank 03 ($030000 - $03FFFF)
    for (let i = 0x030000; i < 0x03FFFF; i++) {
      if (checkTrampoline(i)) {
        console.log(`[applyInGameConfig] Potential trampoline found at 0x${i.toString(16).toUpperCase()}!`);
        trampolineOffset = i;
        isTrampolineInstalled = true;
        break;
      }
    }
  }

  if (!isTrampolineInstalled) {
    console.error("[applyInGameConfig] WorldsCollide Trampoline NOT FOUND anywhere in Bank 03. Configuration patching aborted.");
    return; // Don't proceed if we can't find the hooks
  } else {
    console.log(`[applyInGameConfig] Using trampoline at 0x${trampolineOffset.toString(16).toUpperCase()}.`);
  }

  // Update dynamic addresses based on where we found the trampoline
  const config1Addr = trampolineOffset - 0x09; 
  const config2JsrOp = trampolineOffset + 1;
  const config3JsrOp = trampolineOffset + 4;
  const fontColorAddr = trampolineOffset - 0x23;

  // 1. Config 1: c mmm w bbb
  const c = config.cmdSet === "short" ? 1 : 0;
  const mmm = Math.max(0, Math.min(5, config.msgSpeed - 1));
  const w = config.batMode === "wait" ? 1 : 0;
  const bbb = Math.max(0, Math.min(5, config.batSpeed - 1));

  const config1Byte = (c << 7) | (mmm << 4) | (w << 3) | bbb;
  if (config1Addr < patched.length) {
    patched[config1Addr] = config1Byte;
    console.log(`[applyInGameConfig] Patched Config1 (0x${config1Addr.toString(16)}) with 0x${config1Byte.toString(16).padStart(2, '0')}`);
  }

  // 2. Config 2 (Dynamic location from JSR operand): mbcccsss
  if (config2JsrOp + 1 < patched.length) {
    const lowByte2 = patched[config2JsrOp];
    const highByte2 = patched[config2JsrOp + 1];
    const config2Address = 0x030000 + (highByte2 * 256 + lowByte2) + 1;

    const sss = Math.max(0, Math.min(5, (config.spellOrder || 1) - 1)); 
    const config2Byte = sss; 

    if (config2Address < patched.length) {
      patched[config2Address] = config2Byte;
      console.log(`[applyInGameConfig] Patched Config2 (0x${config2Address.toString(16)}) with 0x${config2Byte.toString(16).padStart(2, '0')}`);
    }
  }

  // 3. Config 3 (Dynamic location from JSR operand): gcsrwwww
  if (config3JsrOp + 1 < patched.length) {
    const lowByte3 = patched[config3JsrOp];
    const highByte3 = patched[config3JsrOp + 1];
    const config3Address = 0x030000 + (highByte3 * 256 + lowByte3) + 1;

    const g = config.gauge === "off" ? 1 : 0;
    const cur = config.cursor === "memory" ? 1 : 0;
    const s = config.sound === "mono" ? 1 : 0;
    const r = config.reequip === "empty" ? 1 : 0;
    const wwww = Math.max(0, Math.min(7, (config.wallpaper || 1) - 1));

    const config3Byte = (g << 7) | (cur << 6) | (s << 5) | (r << 4) | wwww;

    if (config3Address < patched.length) {
      patched[config3Address] = config3Byte;
      console.log(`[applyInGameConfig] Patched Config3 (0x${config3Address.toString(16)}) with 0x${config3Byte.toString(16).padStart(2, '0')}`);
    }
  }

  // 4. Patch global Font Color (2 bytes)
  const fontColor = config.fontColor || [0, 28, 27];
  const val = (fontColor[2] << 10) | (fontColor[1] << 5) | fontColor[0];
  const low = val & 0xFF;
  const high = (val >> 8) & 0xFF;

  if (0x18e806 + 1 < patched.length) {
    patched[0x18e806] = low;
    patched[0x18e806 + 1] = high;
  }
  if (fontColorAddr + 1 < patched.length) {
    patched[fontColorAddr] = low;
    patched[fontColorAddr + 1] = high;
    console.log(`[applyInGameConfig] Patched Font Color at 0x18E806 and 0x${fontColorAddr.toString(16)}`);
  }

  // 5. Patch discrete Window Palette arrays
  for (let i = 1; i <= 8; i++) {
    const key = `window${i}`;
    const startAddress = 0x2d1c02 + (i - 1) * 0x20;
    if (startAddress + 13 >= patched.length) continue;

    const winPalette = config.windowPalettes?.[key] || WINDOW_PALETTE_DEFAULTS[key] || WINDOW_PALETTE_DEFAULTS.window1;

    for (let cIdx = 0; cIdx < 7; cIdx++) {
      const color = winPalette[cIdx] || [0, 0, 0];
      const wVal = (color[2] << 10) | (color[1] << 5) | color[0];
      patched[startAddress + cIdx * 2] = wVal & 0xFF;
      patched[startAddress + cIdx * 2 + 1] = (wVal >> 8) & 0xFF;
    }
  }
  console.log(`[applyInGameConfig] Window palettes 1-8 patched.`);
}

