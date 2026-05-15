import { useEffect, useState } from "react";
import { Card } from "@ff6wc/ui";
import { FaHandPointRight } from "react-icons/fa";
import {
  InGameConfig,
  DEFAULT_IN_GAME_CONFIG,
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
  const [colorTarget, setColorTarget] = useState<"font" | "window">("font");
  const [activeColorIdx, setActiveColorIdx] = useState<number>(0);

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

  const handleRGBChange = (channel: 0 | 1 | 2, val: number) => {
    if (colorTarget === "font") {
      const nextFont = [...(config.fontColor || [31, 31, 31])] as [number, number, number];
      nextFont[channel] = val;
      updateConfig({ fontColor: nextFont });
    } else {
      const key = `window${config.wallpaper || 1}`;
      const currentPalettes = { ...(config.windowPalettes || DEFAULT_IN_GAME_CONFIG.windowPalettes) };
      const currentPalette = [...(currentPalettes[key] || DEFAULT_IN_GAME_CONFIG.windowPalettes[key])];
      const nextColor = [...(currentPalette[activeColorIdx] || [0, 0, 0])] as [number, number, number];
      
      nextColor[channel] = val;
      currentPalette[activeColorIdx] = nextColor;
      currentPalettes[key] = currentPalette;
      
      updateConfig({ windowPalettes: currentPalettes });
    }
  };

  const getActiveColor = (): [number, number, number] => {
    if (colorTarget === "font") {
      return config.fontColor || [31, 31, 31];
    }
    const key = `window${config.wallpaper || 1}`;
    const pal = config.windowPalettes?.[key] || DEFAULT_IN_GAME_CONFIG.windowPalettes[key];
    return pal[activeColorIdx] || [0, 0, 0];
  };

  const activeRGB = getActiveColor();

  const renderOption = <K extends keyof InGameConfig>(
    key: K,
    value: InGameConfig[K],
    label: string
  ) => {
    const isSelected = config[key] === value;

    return (
      <button
        type="button"
        onClick={() => updateConfig({ [key]: value })}
        className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase select-none cursor-pointer outline-none group ${
          isSelected
            ? "text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            : "text-[#6b7496] hover:text-[#d1d5db]"
        }`}
      >
        <div className={`w-6 flex justify-center items-center transition-transform duration-100 ${isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:opacity-30 group-hover:scale-75"}`}>
          <FaHandPointRight className="text-[#dcdcdc]" size={20} />
        </div>
        <span style={{ textShadow: isSelected ? "3px 3px 0px #000000" : "none" }}>
          {label}
        </span>
      </button>
    );
  };

  const renderCapsuleSlider = (label: "R" | "G" | "B", channel: 0 | 1 | 2) => {
    const val = activeRGB[channel];
    return (
      <div className="flex items-center gap-4">
        <div className="w-10 font-mono font-bold text-[#dcdcdc] text-lg flex justify-between pr-2" style={{ textShadow: "2px 2px 0px #000000" }}>
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

  // Render active window background gradient dynamically to matching customization live!
  const currentPalette = config.windowPalettes?.[`window${config.wallpaper || 1}`] || DEFAULT_IN_GAME_CONFIG.windowPalettes[`window${config.wallpaper || 1}`];
  const bgGradient = `linear-gradient(to bottom, ${currentPalette.map(toRGBString).join(", ")})`;

  return (
    <Card title="In-Game Configurations">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          Customize system preferences, spell sortings, and window styles that will automatically be patched directly into your ROM when downloaded.
        </p>

        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-[#b2b6d8] bg-[#050515] shadow-2xl mx-auto select-none">
          
          {/* Authentically Dynamic Background Console */}
          <div 
            className="p-8 md:p-12 flex flex-col gap-4 relative transition-all duration-300 min-h-[540px]"
            style={{ backgroundImage: bgGradient }}
          >
            
            {/* Inner Floating 'Config' Label */}
            <div className="absolute top-0 right-8 translate-y-[-50%]">
              <div className="bg-[#3b4696] border-4 border-[#b2b6d8] rounded-xl px-6 py-1.5 shadow-lg">
                <span className="font-mono font-bold text-2xl text-[#00e1d9] uppercase tracking-widest" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Config
                </span>
              </div>
            </div>

            {page === 1 ? (
              /* ================= PAGE 1 ================= */
              <div className="flex flex-col gap-5 pt-4 animate-fadeIn">
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Bat. Mode
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("batMode", "active", "Active")}
                    {renderOption("batMode", "wait", "Wait")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Bat. Speed
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`batspeed-${val}`}
                          type="button"
                          onClick={() => updateConfig({ batSpeed: val })}
                          className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                            config.batSpeed === val
                              ? "text-white bg-white/15 ring-2 ring-white/40"
                              : "text-[#6b7496] hover:text-slate-200 hover:bg-white/5"
                          }`}
                          style={{ textShadow: config.batSpeed === val ? "3px 3px 0px #000000" : "none" }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between px-3 mt-1 select-none pointer-events-none">
                      <span className="font-mono font-bold text-[#00e1d9] text-xs uppercase tracking-wider" style={{ textShadow: "2px 2px 0px #000000" }}>Fast</span>
                      <span className="font-mono font-bold text-[#00e1d9] text-xs uppercase tracking-wider" style={{ textShadow: "2px 2px 0px #000000" }}>Slow</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Msg. Speed
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`msgspeed-${val}`}
                          type="button"
                          onClick={() => updateConfig({ msgSpeed: val })}
                          className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                            config.msgSpeed === val
                              ? "text-white bg-white/15 ring-2 ring-white/40"
                              : "text-[#6b7496] hover:text-slate-200 hover:bg-white/5"
                          }`}
                          style={{ textShadow: config.msgSpeed === val ? "3px 3px 0px #000000" : "none" }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between px-3 mt-1 select-none pointer-events-none">
                      <span className="font-mono font-bold text-[#00e1d9] text-xs uppercase tracking-wider" style={{ textShadow: "2px 2px 0px #000000" }}>Fast</span>
                      <span className="font-mono font-bold text-[#00e1d9] text-xs uppercase tracking-wider" style={{ textShadow: "2px 2px 0px #000000" }}>Slow</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Cmd. Set
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("cmdSet", "window", "Window")}
                    {renderOption("cmdSet", "short", "Short")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Gauge
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("gauge", "on", "On")}
                    {renderOption("gauge", "off", "Off")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Sound
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("sound", "stereo", "Stereo")}
                    {renderOption("sound", "mono", "Mono")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Cursor
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("cursor", "reset", "Reset")}
                    {renderOption("cursor", "memory", "Memory")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Reequip
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("reequip", "optimum", "Optimum")}
                    {renderOption("reequip", "empty", "Empty")}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Controller
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    {renderOption("controller", "single", "Single")}
                    {renderOption("controller", "multiple", "Multiple")}
                  </div>
                </div>

                {/* Arrow Indicator down to Page 2 */}
                <div className="w-full flex justify-center mt-2">
                  <button 
                    type="button"
                    onClick={() => setPage(2)}
                    className="animate-bounce cursor-pointer opacity-80 hover:opacity-100 focus:outline-none p-2 group"
                  >
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-[#dcdcdc] group-hover:border-t-white transition-colors" />
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
                    className="animate-pulse cursor-pointer opacity-80 hover:opacity-100 focus:outline-none p-2 group"
                  >
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-[#dcdcdc] group-hover:border-b-white transition-colors" />
                  </button>
                </div>

                {/* Mag. Order */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                    <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                      Mag. Order
                    </div>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <button
                          key={`spellorder-${val}`}
                          type="button"
                          onClick={() => updateConfig({ spellOrder: val })}
                          className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                            (config.spellOrder || 1) === val
                              ? "text-white bg-white/15 ring-2 ring-white/40"
                              : "text-[#6b7496] hover:text-slate-200 hover:bg-white/5"
                          }`}
                          style={{ textShadow: (config.spellOrder || 1) === val ? "3px 3px 0px #000000" : "none" }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Spell permutation listing block */}
                  <div className="pl-12 sm:pl-56 flex flex-col gap-1 font-mono text-lg font-bold text-[#dcdcdc] tracking-widest select-none" style={{ textShadow: "2px 2px 0px #000000" }}>
                    {getSpellOrderRows(config.spellOrder || 1).map((row) => (
                      <div key={row.label} className="flex gap-4 items-center">
                        <span className="w-6 text-white uppercase">{row.label}</span>
                        <span className="text-slate-300 text-xs">••</span>
                        <span>{row.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Window Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-2">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Window
                  </div>
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
                      <button
                        key={`window-${val}`}
                        type="button"
                        onClick={() => updateConfig({ wallpaper: val })}
                        className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                          (config.wallpaper || 1) === val
                            ? "text-white bg-white/15 ring-2 ring-white/40"
                            : "text-[#6b7496] hover:text-slate-200 hover:bg-white/5"
                        }`}
                        style={{ textShadow: (config.wallpaper || 1) === val ? "3px 3px 0px #000000" : "none" }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Target Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-1">
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                    Color
                  </div>
                  <div className="flex gap-6 items-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => setColorTarget("font")}
                      className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase cursor-pointer outline-none group ${
                        colorTarget === "font" ? "text-white" : "text-[#6b7496] hover:text-[#d1d5db]"
                      }`}
                    >
                      <div className={`w-6 flex justify-center items-center transition-opacity ${colorTarget === "font" ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`}>
                        <FaHandPointRight className="text-[#dcdcdc]" size={20} />
                      </div>
                      <span style={{ textShadow: colorTarget === "font" ? "3px 3px 0px #000000" : "none" }}>Font</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setColorTarget("window")}
                      className={`relative flex items-center gap-2 px-2 py-1 font-mono font-bold text-lg tracking-widest uppercase cursor-pointer outline-none group ${
                        colorTarget === "window" ? "text-white" : "text-[#6b7496] hover:text-[#d1d5db]"
                      }`}
                    >
                      <div className={`w-6 flex justify-center items-center transition-opacity ${colorTarget === "window" ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`}>
                        <FaHandPointRight className="text-[#dcdcdc]" size={20} />
                      </div>
                      <span style={{ textShadow: colorTarget === "window" ? "3px 3px 0px #000000" : "none" }}>Window</span>
                    </button>
                  </div>
                </div>

                {/* Gradient Palette Editing Swatches (Visible only when Color === Window) */}
                <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 transition-opacity duration-300 ${colorTarget === "window" ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  <div className="w-48 flex-shrink-0 font-mono font-bold text-[#8e91a8] text-lg tracking-wider" style={{ textShadow: "2px 2px 0px #000000" }}>
                    Gradient
                  </div>
                  <div className="flex gap-1 p-1.5 bg-[#050515]/40 border border-[#5a5d75] rounded-md select-none shadow-inner">
                    {currentPalette.map((col, cIdx) => {
                      const isSelected = colorTarget === "window" && activeColorIdx === cIdx;
                      return (
                        <button
                          key={`gradient-swatch-${cIdx}`}
                          type="button"
                          onClick={() => {
                            setColorTarget("window");
                            setActiveColorIdx(cIdx);
                          }}
                          className={`w-8 h-8 rounded transition-all duration-100 shadow-md focus:outline-none relative ${
                            isSelected ? "ring-2 ring-white scale-110 z-10 shadow-white/20" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: toRGBString(col) }}
                          title={`Color ${cIdx + 1}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 border border-black rounded opacity-50" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RGB Sliders Editor Block */}
                <div className="pl-0 sm:pl-56 flex flex-col gap-3 mt-2">
                  
                  {/* Current active color preview preview block */}
                  <div className="flex items-center gap-3 mb-1 font-mono font-bold text-xs text-[#8e91a8]" style={{ textShadow: "1px 1px 0px #000000" }}>
                    <span>Active Select:</span>
                    <div 
                      className="w-16 h-6 rounded border border-[#c5c7d6] shadow-inner"
                      style={{ backgroundColor: toRGBString(activeRGB) }}
                    />
                    <span className="text-[#dcdcdc] uppercase tracking-widest">
                      {colorTarget === "font" ? "Global Font" : `Window Col ${activeColorIdx + 1}`}
                    </span>
                  </div>

                  {renderCapsuleSlider("R", 0)}
                  {renderCapsuleSlider("G", 1)}
                  {renderCapsuleSlider("B", 2)}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </Card>
  );
};
