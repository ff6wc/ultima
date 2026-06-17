import { Button, Card, HelperText } from "@ff6wc/ui";
import sampleSize from "lodash/sampleSize";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  defaultCharacterNameString,
  defaultPaletteString,
  defaultPortraitString,
  defaultSpritePaletteString,
  defaultSpriteString,
} from "~/constants/graphicConstants";
import { setFlag } from "~/state/flagSlice";
import {
  LoadPalettesResponse,
  LoadSpritesResponse,
} from "~/components/CharacterGraphicSelector/CharacterGraphicSelector";

const GFX_PERSIST_KEY = "gfx_persist_enabled";

// Total sprite/portrait positions across characters + other sprites
const TOTAL_SPRITE_POSITIONS = defaultSpriteString.split(".").length; // 20
const TOTAL_PORTRAIT_POSITIONS = defaultPortraitString.split(".").length; // 15
const TOTAL_PALETTE_POSITIONS = defaultPaletteString.split(".").length; // 7

type GraphicsOptionsCardProps = {
  palettes: LoadPalettesResponse;
  portraits: LoadSpritesResponse;
  sprites: LoadSpritesResponse;
};

export const GraphicsOptionsCard = ({
  palettes,
  portraits,
  sprites,
}: GraphicsOptionsCardProps) => {
  const dispatch = useDispatch();

  const [persistEnabled, setPersistEnabled] = useState(false);

  // Read the persisted toggle state on mount
  useEffect(() => {
    setPersistEnabled(localStorage.getItem(GFX_PERSIST_KEY) === "true");
  }, []);

  const handleToggle = () => {
    const next = !persistEnabled;
    setPersistEnabled(next);
    if (next) {
      localStorage.setItem(GFX_PERSIST_KEY, "true");
    } else {
      localStorage.removeItem(GFX_PERSIST_KEY);
      // Clear any saved graphics values so they don't ghost back in later
      ["gfx_name", "gfx_cpal", "gfx_cpor", "gfx_cspr", "gfx_cspp"].forEach(
        (k) => localStorage.removeItem(k),
      );
    }
  };

  const randomizeAll = () => {
    if (!sprites.length || !portraits.length || !palettes.length) return;

    // Randomize ALL sprite positions (characters + other sprites = 20 total)
    const newSprites = sampleSize(
      sprites.map(({ id }) => id),
      TOTAL_SPRITE_POSITIONS,
    );
    dispatch(setFlag({ flag: "-cspr", value: newSprites.join(".") }));

    // Randomize ALL portrait positions (14 characters + IMP = 15 total)
    const newPortraits = sampleSize(
      portraits.map(({ id }) => id),
      TOTAL_PORTRAIT_POSITIONS,
    );
    dispatch(setFlag({ flag: "-cpor", value: newPortraits.join(".") }));

    // Randomize all 7 palette slots
    const newPalettes = sampleSize(
      palettes.map(({ id }) => id),
      TOTAL_PALETTE_POSITIONS,
    );
    dispatch(setFlag({ flag: "-cpal", value: newPalettes.join(".") }));
  };

  const restoreDefaults = () => {
    dispatch(setFlag({ flag: "-cspr", value: defaultSpriteString }));
    dispatch(setFlag({ flag: "-cpor", value: defaultPortraitString }));
    dispatch(setFlag({ flag: "-cpal", value: defaultPaletteString }));
    dispatch(setFlag({ flag: "-cspp", value: defaultSpritePaletteString }));
    dispatch(setFlag({ flag: "-name", value: defaultCharacterNameString }));
  };

  const isLoaded =
    sprites.length > 0 && portraits.length > 0 && palettes.length > 0;

  return (
    <Card title="Graphics Options">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap w-full">
        {/* Action buttons */}
        <span className="flex gap-2 flex-wrap">
          <Button
            disabled={!isLoaded}
            onClick={randomizeAll}
            variant="primary"
            className="w-[160px]"
          >
            Randomize All
          </Button>
          <Button
            onClick={restoreDefaults}
            variant="default"
            className="w-[160px] !bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 !text-slate-800 dark:!text-slate-100 hover:!bg-slate-50 dark:hover:!bg-slate-800 shadow-sm transition-all duration-200"
          >
            Restore Defaults
          </Button>
        </span>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Save Graphics Settings Toggle */}
        <div className="flex items-center gap-3 select-none group">
          {/* Toggle pill */}
          <button
            id="gfx-persist-toggle"
            role="switch"
            aria-checked={persistEnabled}
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              persistEnabled
                ? "bg-blue-600 dark:bg-blue-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                persistEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <label
            htmlFor="gfx-persist-toggle"
            className="flex flex-col cursor-pointer"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Save Graphics Settings
            </span>
            <HelperText>Settings will persist across reloads</HelperText>
          </label>
        </div>
      </div>
    </Card>
  );
};
