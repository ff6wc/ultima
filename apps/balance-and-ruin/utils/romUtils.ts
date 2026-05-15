import { DEFAULT_IN_GAME_CONFIG } from "~/types/inGameConfig";

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
export function applyInGameConfig(patched: Uint8Array) {
  if (typeof window === "undefined") return;

  const saved = localStorage.getItem("in_game_config");
  let config = DEFAULT_IN_GAME_CONFIG;
  if (saved) {
    try {
      config = { ...DEFAULT_IN_GAME_CONFIG, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // 1. Config 1 (Fixed location): c mmm w bbb
  const c = config.cmdSet === "short" ? 1 : 0;
  const mmm = Math.max(0, Math.min(5, config.msgSpeed - 1));
  const w = config.batMode === "wait" ? 1 : 0;
  const bbb = Math.max(0, Math.min(5, config.batSpeed - 1));

  const config1Byte = (c << 7) | (mmm << 4) | (w << 3) | bbb;
  if (0x0370b9 < patched.length) {
    patched[0x0370b9] = config1Byte;
  }

  // 2. Config 2 (Dynamic location from $0370C3): mbcccsss
  if (0x0370c3 + 1 < patched.length) {
    const lowByte2 = patched[0x0370c3];
    const highByte2 = patched[0x0370c3 + 1];
    const config2Address = 0x030000 + (highByte2 * 256 + lowByte2) + 1;

    const m = config.controller === "multiple" ? 1 : 0;
    const config2Byte = m << 7; // Unused bytes remain 0

    if (config2Address < patched.length) {
      patched[config2Address] = config2Byte;
    }
  }

  // 3. Config 3 (Dynamic location from $0370C6): gcsrwwww
  if (0x0370c6 + 1 < patched.length) {
    const lowByte3 = patched[0x0370c6];
    const highByte3 = patched[0x0370c6 + 1];
    const config3Address = 0x030000 + (highByte3 * 256 + lowByte3) + 1;

    const g = config.gauge === "off" ? 1 : 0;
    const cur = config.cursor === "memory" ? 1 : 0;
    const s = config.sound === "mono" ? 1 : 0;
    const r = config.reequip === "empty" ? 1 : 0;

    const config3Byte = (g << 7) | (cur << 6) | (s << 5) | (r << 4); // 4 bits wallpaper default to 0

    if (config3Address < patched.length) {
      patched[config3Address] = config3Byte;
    }
  }
}

