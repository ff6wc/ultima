import { useEffect, useState } from "react";
import { Card } from "@ff6wc/ui";
import { FaHandPointRight } from "react-icons/fa";
import {
  InGameConfig,
  DEFAULT_IN_GAME_CONFIG,
} from "~/types/inGameConfig";

export const InGameConfigCard = () => {
  const [config, setConfig] = useState<InGameConfig>(DEFAULT_IN_GAME_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem("in_game_config");
    if (saved) {
      try {
        setConfig({ ...DEFAULT_IN_GAME_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        // fall back to default
      }
    }
  }, []);

  const updateConfig = (updates: Partial<InGameConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    localStorage.setItem("in_game_config", JSON.stringify(next));
  };

  const renderOption = <K extends keyof InGameConfig>(
    key: K,
    value: InGameConfig[K],
    label: string
  ) => {
    const isSelected = config[key] === value;

    return (
      <button
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

  return (
    <Card title="In-Game Configurations">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          Customize system preferences that will automatically be patched directly into your ROM when downloaded. 
          You will not need to manually change these options on your console.
        </p>

        {/* Retro SNES Config Screen Wrapper */}
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-[#b2b6d8] bg-[#050515] shadow-2xl mx-auto select-none">
          {/* Gradient Console Viewport */}
          <div className="bg-gradient-to-b from-[#3b4696] via-[#252c6b] to-[#0b0b30] p-8 md:p-12 flex flex-col gap-6 relative">
            
            {/* Inner Floating 'Config' Label */}
            <div className="absolute top-0 right-8 translate-y-[-50%]">
              <div className="bg-[#3b4696] border-4 border-[#b2b6d8] rounded-xl px-6 py-1.5 shadow-lg">
                <span className="font-mono font-bold text-2xl text-[#00e1d9] uppercase tracking-widest" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Config
                </span>
              </div>
            </div>

            {/* Option Grid */}
            <div className="flex flex-col gap-5 pt-4">
              
              {/* Row: Bat. Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-transparent">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Bat. Mode
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("batMode", "active", "Active")}
                  {renderOption("batMode", "wait", "Wait")}
                </div>
              </div>

              {/* Row: Bat. Speed */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Bat. Speed
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5, 6].map((val) => (
                      <button
                        key={`batspeed-${val}`}
                        onClick={() => updateConfig({ batSpeed: val })}
                        className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                          config.batSpeed === val
                            ? "text-white bg-white/10 ring-2 ring-white/40"
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

              {/* Row: Msg. Speed */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Msg. Speed
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5, 6].map((val) => (
                      <button
                        key={`msgspeed-${val}`}
                        onClick={() => updateConfig({ msgSpeed: val })}
                        className={`w-10 h-10 flex justify-center items-center font-mono font-bold text-xl select-none cursor-pointer rounded-lg transition-colors ${
                          config.msgSpeed === val
                            ? "text-white bg-white/10 ring-2 ring-white/40"
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

              {/* Row: Cmd. Set */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Cmd. Set
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("cmdSet", "window", "Window")}
                  {renderOption("cmdSet", "short", "Short")}
                </div>
              </div>

              {/* Row: Gauge */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Gauge
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("gauge", "on", "On")}
                  {renderOption("gauge", "off", "Off")}
                </div>
              </div>

              {/* Row: Sound */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Sound
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("sound", "stereo", "Stereo")}
                  {renderOption("sound", "mono", "Mono")}
                </div>
              </div>

              {/* Row: Cursor */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Cursor
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("cursor", "reset", "Reset")}
                  {renderOption("cursor", "memory", "Memory")}
                </div>
              </div>

              {/* Row: Reequip */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Reequip
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("reequip", "optimum", "Optimum")}
                  {renderOption("reequip", "empty", "Empty")}
                </div>
              </div>

              {/* Row: Controller */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <div className="w-48 flex-shrink-0 font-mono font-bold text-[#00e1d9] text-xl tracking-wider" style={{ textShadow: "3px 3px 0px #000000" }}>
                  Controller
                </div>
                <div className="flex gap-6 items-center flex-wrap">
                  {renderOption("controller", "single", "Single")}
                  {renderOption("controller", "multiple", "Multiple")}
                </div>
              </div>

            </div>
            
            {/* Lower Navigation Scroll Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center animate-bounce">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#dcdcdc]" />
            </div>
            
          </div>
        </div>
      </div>
    </Card>
  );
};
