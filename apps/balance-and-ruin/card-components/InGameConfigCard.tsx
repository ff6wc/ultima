import { useEffect, useState } from "react";
import { Button, Card } from "@ff6wc/ui";
import { FaHandPointRight } from "react-icons/fa";
import {
  InGameConfig,
  DEFAULT_IN_GAME_CONFIG,
  WINDOW_PALETTE_DEFAULTS,
  DEFAULT_FONT_COLOR,
} from "~/types/inGameConfig";

const toRGBString = ([r, g, b]: [number, number, number]) => {
  const r255 = Math.round(r * (255 / 31));
  const g255 = Math.round(g * (255 / 31));
  const b255 = Math.round(b * (255 / 31));
  return `rgb(${r255}, ${g255}, ${b255})`;
};

// Get the permutation listing for spell orders based on standard game mappings
const getSpellOrderRows = (order: number) => {
  const list = ["Attack", "Healing", "Effect"];
  let items = ["Attack", "Healing", "Effect"];
  
  switch (order) {
    case 1: items = ["Attack", "Healing", "Effect"]; break; // A, B, C
    case 2: items = ["Attack", "Effect", "Healing"]; break; // A, C, B
    case 3: items = ["Healing", "Attack", "Effect"]; break; // B, A, C
    case 4: items = ["Healing", "Effect", "Attack"]; break; // B, C, A
    case 5: items = ["Effect", "Attack", "Healing"]; break; // C, A, B
    case 6: items = ["Effect", "Healing", "Attack"]; break; // C, B, A
  }
  return [
    { label: "A", text: items[0] },
    { label: "B", text: items[1] },
    { label: "C", text: items[2] },
  ];
};

export const InGameConfigCard = () => {
  const [config, setConfig] = useState<InGameConfig>(DEFAULT_IN_GAME_CONFIG);
  const [page, setPage] = useState<1 | 2>(1);
  const [colorTarget, setColorTarget] = useState<"font" | "window">("window");
  const [activeColorIdx, setActiveColorIdx] = useState<number>(6); // Default to far-right background index!
  const [wallpaperPattern, setWallpaperPattern] = useState<string>("");

  useEffect(() => {
    const wp = config.wallpaper || 1;
    const img = new Image();
    img.src = `/assets/W${wp}/defaultB.png`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Crop a clean 32x32 seamless wallpaper tile directly to the left of the RGB sliders on Page 2 (defaultB.png)
        ctx.drawImage(img, 16, 160, 32, 32, 0, 0, 32, 32);

        const imgData = ctx.getImageData(0, 0, 32, 32);
        const data = imgData.data;

        // 1. Calculate average gray luminosity of the tile
        let sum = 0;
        const grays = new Float32Array(32 * 32);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          grays[i / 4] = gray;
          sum += gray;
        }
        const avgGray = sum / (32 * 32);

        // 2. Map differences from the average to alpha channels of pure white (highlights) and black (shadows)
        for (let i = 0; i < data.length; i += 4) {
          const gray = grays[i / 4];
          const diff = gray - avgGray;

          if (diff >= 0) {
            // Highlight: Blend pure white on top with alpha proportional to the positive difference
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = Math.min(255, Math.round(diff * 3.0));
          } else {
            // Shadow: Blend pure black on top with alpha proportional to the negative difference
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = Math.min(255, Math.round(-diff * 3.0));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setWallpaperPattern(canvas.toDataURL("image/png"));
      }
    };
    img.onerror = () => {
      setWallpaperPattern("");
    };
  }, [config.wallpaper]);

  useEffect(() => {
    const saved = localStorage.getItem("in_game_config");
    if (saved) {
      try {
        setConfig({ ...DEFAULT_IN_GAME_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        // Fall back quietly
      }
    }
  }, []);

  const updateConfig = (updates: Partial<InGameConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    localStorage.setItem("in_game_config", JSON.stringify(next));
  };

  const handleRestoreDefaults = () => {
    setConfig(DEFAULT_IN_GAME_CONFIG);
    localStorage.setItem("in_game_config", JSON.stringify(DEFAULT_IN_GAME_CONFIG));
    setPage(1);
    setColorTarget("window");
    setActiveColorIdx(6);
  };

  const handleRGBChange = (channel: 0 | 1 | 2, val: number) => {
    if (colorTarget === "font") {
      const nextColor = [...(config.fontColor || DEFAULT_FONT_COLOR)] as [number, number, number];
      nextColor[channel] = val;
      updateConfig({ fontColor: nextColor });
    } else {
      const key = `window${config.wallpaper || 1}`;
      const palettes = { ...(config.windowPalettes || DEFAULT_IN_GAME_CONFIG.windowPalettes) };
      const currentPalette = [...(palettes[key] || WINDOW_PALETTE_DEFAULTS[key] || WINDOW_PALETTE_DEFAULTS.window1)];
      const nextColor = [...(currentPalette[activeColorIdx] || [0, 0, 0])] as [number, number, number];
      
      nextColor[channel] = val;
      currentPalette[activeColorIdx] = nextColor;
      palettes[key] = currentPalette;
      updateConfig({ windowPalettes: palettes });
    }
  };

  const getActiveRGB = (): [number, number, number] => {
    if (colorTarget === "font") {
      return config.fontColor || DEFAULT_FONT_COLOR;
    }
    const key = `window${config.wallpaper || 1}`;
    const pal = config.windowPalettes?.[key] || WINDOW_PALETTE_DEFAULTS[key] || WINDOW_PALETTE_DEFAULTS.window1;
    return pal[activeColorIdx] || [0, 0, 0];
  };

  const activeRGB = getActiveRGB();

  const renderOption = <K extends keyof InGameConfig>(
    key: K,
    value: InGameConfig[K],
    label: string,
    textColorStyle?: string
  ) => {
    const isSelected = config[key] === value;

    return (
      <button
        type="button"
        onClick={() => updateConfig({ [key]: value })}
        className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase select-none cursor-pointer outline-none group ${
          isSelected ? "scale-100" : "hover:scale-105"
        }`}
        style={{ color: isSelected ? textColorStyle : "rgba(255, 255, 255, 0.75)" }}
      >
        <div className={`w-6 flex justify-center items-center transition-transform duration-100 ${isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:opacity-30 group-hover:scale-75"}`}>
          <FaHandPointRight style={{ color: isSelected ? textColorStyle : "#dcdcdc" }} size={20} />
        </div>
        <span style={{ textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
          {label}
        </span>
      </button>
    );
  };


  const renderCapsuleSlider = (label: "R" | "G" | "B", channel: 0 | 1 | 2, fontColorStyle?: string) => {
    const val = activeRGB[channel];
    return (
      <div className="flex items-center gap-4">
        <div className="w-12 font-bold text-lg flex justify-between pr-2" style={{ color: fontColorStyle || "#dcdcdc", textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
          <span>{label}</span>
          <span>{val}</span>
        </div>
        <div className="relative w-48 sm:w-64 h-5 bg-gradient-to-b from-[#8e91a8] to-[#5a5d75] rounded-full border-2 border-[#c5c7d6] flex items-center p-0.5 shadow-inner group">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all"
            style={{ width: `${(val / 31) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="31"
            value={val}
            onChange={(e) => handleRGBChange(channel, parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    );
  };


  // Calculate layout variables driven directly by distinct array positions!
  const activeKey = `window${config.wallpaper || 1}`;
  
  const winPalette = config.windowPalettes?.[activeKey] || WINDOW_PALETTE_DEFAULTS[activeKey] || WINDOW_PALETTE_DEFAULTS.window1;
  const activeGradient = winPalette;

  // High Fidelity CSS mapping based on discrete element indexes!
  // Index 5 & 6 are Background Top & Bottom
  const bgGradient = `linear-gradient(to bottom, ${toRGBString(winPalette[5] || [6, 6, 17])}, ${toRGBString(winPalette[6] || [5, 5, 16])})`;
  // Index 0 & 1 are frame highlights
  const frameEdge = toRGBString(winPalette[0] || [25, 28, 28]);
  const frameHighlight = toRGBString(winPalette[1] || [20, 22, 22]);
  const frameShadow = toRGBString(winPalette[4] || [5, 6, 6]);

  // Text mapping: Font mappings set in game by the python script affect ONLY the Cyan text color!
  const headerColor = toRGBString(config.fontColor || DEFAULT_FONT_COLOR);
  const bodyTextColor = "rgb(255, 255, 255)"; // Pure white console text for maximum contrast
  const subShadowColor = "rgba(255, 255, 255, 0.5)";

  // Labeling mappings for custom gradient bar selections
  const getIndexName = (idx: number) => {
    if (colorTarget === "window") {
      switch(idx) {
        case 0: return "Frame Outer Light";
        case 1: return "Frame Inner Light";
        case 2: return "Frame Bevel Edge";
        case 3: return "Frame Inner Border";
        case 4: return "Deep Shadow Rim";
        case 5: return "Background (Top)";
        case 6: return "Background (Bottom)";
        default: return `Element ${idx}`;
      }
    } else {
      return "Global Font Color";
    }
  };


  return (
    <Card title="In-Game Configurations">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Customize system preferences, spell sortings, and window styles that will automatically be patched directly into your ROM when downloaded.
          </p>
          <Button
            type="button"
            onClick={handleRestoreDefaults}
            variant="default"
            className="w-full sm:w-auto !bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 !text-slate-800 dark:!text-slate-100 hover:!bg-slate-50 dark:hover:!bg-slate-800 shadow-sm transition-all duration-200 text-sm font-semibold flex-shrink-0"
          >
            Restore Defaults
          </Button>
        </div>

        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-[#b2b6d8] bg-[#050515] shadow-2xl mx-auto select-none">
          
          {/* High Fidelity Dynamic Console with authentic border components */}
          <div 
            className="p-8 md:p-12 flex flex-col gap-4 relative transition-all duration-300 min-h-[540px] rounded-md overflow-hidden"
            style={{ 
              backgroundImage: wallpaperPattern 
                ? `url(${wallpaperPattern}), ${bgGradient}` 
                : bgGradient,
              backgroundRepeat: "repeat, no-repeat",
              backgroundSize: wallpaperPattern ? "96px 96px, cover" : "cover",
              border: `4px solid ${frameEdge}`,
              boxShadow: `inset 0 0 0 2px ${frameHighlight}, inset 0 0 0 4px ${frameShadow}, 0 8px 30px rgba(0,0,0,0.5)`,
              imageRendering: "pixelated"
            }}
          >
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }} />

            


            {page === 1 ? (
              /* ================= PAGE 1 ================= */
              <div className="flex flex-col gap-5 pt-4 animate-fadeIn">
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Bat. Mode
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("batMode", "active", "Active", bodyTextColor)}
                    {renderOption("batMode", "wait", "Wait", bodyTextColor)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Bat. Speed
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`batspeed-${val}`}
                          type="button"
                          onClick={() => updateConfig({ batSpeed: val })}
                          className={`w-10 h-10 flex justify-center items-center font-bold text-xl select-none cursor-pointer rounded-sm transition-colors`}
                          style={{ 
                            color: config.batSpeed === val ? bodyTextColor : "rgba(255,255,255,0.75)", 
                            backgroundColor: config.batSpeed === val ? "rgba(255,255,255,0.15)" : "transparent",
                            boxShadow: config.batSpeed === val ? `0 0 0 2px ${bodyTextColor}` : "none",
                            textShadow: "2px 2px 0px #000000",
                            fontFamily: "'Final Fantasy 3/6 Font', monospace"
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between px-3 mt-1 select-none pointer-events-none">
                      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Fast</span>
                      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Slow</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Msg. Speed
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`msgspeed-${val}`}
                          type="button"
                          onClick={() => updateConfig({ msgSpeed: val })}
                          className={`w-10 h-10 flex justify-center items-center font-bold text-xl select-none cursor-pointer rounded-sm transition-colors`}
                          style={{ 
                            color: config.msgSpeed === val ? bodyTextColor : "rgba(255,255,255,0.75)", 
                            backgroundColor: config.msgSpeed === val ? "rgba(255,255,255,0.15)" : "transparent",
                            boxShadow: config.msgSpeed === val ? `0 0 0 2px ${bodyTextColor}` : "none",
                            textShadow: "2px 2px 0px #000000",
                            fontFamily: "'Final Fantasy 3/6 Font', monospace"
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between px-3 mt-1 select-none pointer-events-none">
                      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Fast</span>
                      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Slow</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Cmd. Set
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("cmdSet", "window", "Window", bodyTextColor)}
                    {renderOption("cmdSet", "short", "Short", bodyTextColor)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Gauge
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("gauge", "on", "On", bodyTextColor)}
                    {renderOption("gauge", "off", "Off", bodyTextColor)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Sound
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("sound", "stereo", "Stereo", bodyTextColor)}
                    {renderOption("sound", "mono", "Mono", bodyTextColor)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Cursor
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("cursor", "reset", "Reset", bodyTextColor)}
                    {renderOption("cursor", "memory", "Memory", bodyTextColor)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Reequip
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("reequip", "optimum", "Optimum", bodyTextColor)}
                    {renderOption("reequip", "empty", "Empty", bodyTextColor)}
                  </div>
                </div>

                {/* Arrow Indicator down to Page 2 */}
                <div className="w-full flex justify-center mt-2">
                  <button 
                    type="button"
                    onClick={() => setPage(2)}
                    className="animate-bounce cursor-pointer focus:outline-none p-2 group"
                  >
                    <div 
                      className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[16px] border-t-white transition-all duration-150 group-hover:scale-110" 
                      style={{ filter: "drop-shadow(2px 2px 0px #000000)" }}
                    />
                  </button>
                </div>
              </div>

            ) : (
              /* ================= PAGE 2 ================= */
              <div className="flex flex-col gap-4 animate-fadeIn relative pt-4">
                
                {/* Arrow Indicator up to Page 1 */}
                <div className="w-full flex justify-center -mt-6">
                  <button 
                    type="button"
                    onClick={() => setPage(1)}
                    className="animate-bounce cursor-pointer focus:outline-none p-2 group"
                  >
                    <div 
                      className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[16px] border-b-white transition-all duration-150 group-hover:scale-110" 
                      style={{ filter: "drop-shadow(2px 2px 0px #000000)" }}
                    />
                  </button>
                </div>

                {/* Mag. Order */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                    <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                      Mag. Order
                    </div>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`spellorder-${val}`}
                          type="button"
                          onClick={() => updateConfig({ spellOrder: val })}
                          className={`w-10 h-10 flex justify-center items-center font-bold text-xl select-none cursor-pointer rounded-sm transition-colors`}
                          style={{ 
                            color: (config.spellOrder || 1) === val ? bodyTextColor : "rgba(255,255,255,0.75)", 
                            backgroundColor: (config.spellOrder || 1) === val ? "rgba(255,255,255,0.15)" : "transparent",
                            boxShadow: (config.spellOrder || 1) === val ? `0 0 0 2px ${bodyTextColor}` : "none",
                            textShadow: "2px 2px 0px #000000",
                            fontFamily: "'Final Fantasy 3/6 Font', monospace"
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Spell permutation listing block */}
                  <div className="pl-12 sm:pl-48 flex flex-col gap-1 font-bold tracking-widest select-none" style={{ color: bodyTextColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    {getSpellOrderRows(config.spellOrder || 1).map((row) => (
                      <div key={row.label} className="flex gap-4 items-center">
                        <span className="w-6 uppercase" style={{ color: bodyTextColor }}>{row.label}</span>
                        <span className="text-xs" style={{ color: subShadowColor }}>••</span>
                        <span>{row.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Window Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-2">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Window
                  </div>
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
                      <button
                        key={`window-${val}`}
                        type="button"
                        onClick={() => updateConfig({ wallpaper: val })}
                        className={`w-10 h-10 flex justify-center items-center font-bold text-xl select-none cursor-pointer rounded-sm transition-colors`}
                        style={{ 
                          color: (config.wallpaper || 1) === val ? bodyTextColor : "rgba(255,255,255,0.75)", 
                          backgroundColor: (config.wallpaper || 1) === val ? "rgba(255,255,255,0.15)" : "transparent",
                          boxShadow: (config.wallpaper || 1) === val ? `0 0 0 2px ${bodyTextColor}` : "none",
                          textShadow: "2px 2px 0px #000000",
                          fontFamily: "'Final Fantasy 3/6 Font', monospace"
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Target Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-1">
                  <div className="w-40 flex-shrink-0 font-bold text-xl tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                    Color
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => setColorTarget("font")}
                      className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase cursor-pointer outline-none group`}
                      style={{ color: colorTarget === "font" ? bodyTextColor : "rgba(255,255,255,0.75)" }}
                    >
                      <div className={`w-6 flex justify-center items-center transition-opacity ${colorTarget === "font" ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`}>
                        <FaHandPointRight style={{ color: bodyTextColor }} size={20} />
                      </div>
                      <span style={{ textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Font</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setColorTarget("window")}
                      className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase cursor-pointer outline-none group`}
                      style={{ color: colorTarget === "window" ? bodyTextColor : "rgba(255,255,255,0.75)" }}
                    >
                      <div className={`w-6 flex justify-center items-center transition-opacity ${colorTarget === "window" ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`}>
                        <FaHandPointRight style={{ color: bodyTextColor }} size={20} />
                      </div>
                      <span style={{ textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>Window</span>
                    </button>
                  </div>
                </div>

                {/* Gradient Palette Element Selection (Interactive square selector representing component elements!) */}
                {colorTarget === "window" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-1 animate-fadeIn">
                    <div className="w-40 flex-shrink-0 font-bold text-lg tracking-wider" style={{ color: headerColor, textShadow: "2px 2px 0px #000000", fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                      Gradient
                    </div>
                    <div className="flex gap-1 p-1.5 rounded-md select-none shadow-inner border border-black/20" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                      {activeGradient.map((col, cIdx) => {
                        const isSelected = activeColorIdx === cIdx;
                        return (
                          <button
                            key={`gradient-swatch-${cIdx}`}
                            type="button"
                            onClick={() => setActiveColorIdx(cIdx)}
                            className={`w-8 h-8 rounded transition-all duration-100 shadow-md focus:outline-none relative border border-black/30 ${
                              isSelected ? "ring-2 ring-white scale-110 z-10 shadow-white/40" : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: toRGBString(col) }}
                            title={getIndexName(cIdx)}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 border border-black rounded opacity-50" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RGB Sliders Editor Block */}
                <div className="pl-0 sm:pl-56 flex flex-col gap-3 mt-2 animate-fadeIn">
                  
                  {/* Target Element identifier block */}
                  <div className="flex items-center gap-3 mb-1 font-mono font-bold text-xs" style={{ color: headerColor, textShadow: "1px 1px 0px #000000" }}>
                    <span>Selected:</span>
                    <div 
                      className="w-16 h-6 rounded shadow-inner border border-black/30"
                      style={{ backgroundColor: toRGBString(activeRGB) }}
                    />
                    <span className="uppercase tracking-widest" style={{ color: bodyTextColor, fontFamily: "'Final Fantasy 3/6 Font', monospace" }}>
                      {getIndexName(activeColorIdx)}
                    </span>
                  </div>

                  {renderCapsuleSlider("R", 0, bodyTextColor)}
                  {renderCapsuleSlider("G", 1, bodyTextColor)}
                  {renderCapsuleSlider("B", 2, bodyTextColor)}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </Card>
  );
};
