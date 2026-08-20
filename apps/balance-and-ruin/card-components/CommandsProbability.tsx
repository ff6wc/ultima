import {
  ALL_COMMANDS,
  COMMON_COMMANDS,
  FIGHT,
  ITEM,
  MAGIC,
  MORPH,
  NONE,
  PROBABILITY_COMMAND_IDS,
} from "@ff6wc/ff6-types";
import { Card, Slider, Switch } from "@ff6wc/ui";
import orderBy from "lodash/orderBy";
import { useCallback, useMemo } from "react";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { InputLabel } from "~/components/InputLabel/InputLabel";
import { Select, SelectOption } from "~/components/Select/Select";
import { setFlag, useFlagValueSelector } from "~/state/flagSlice";
import { selectShowFlags } from "~/state/settingsSlice";
import {
  LEGACY_REC_FLAGS,
  parseExcluded,
} from "~/utils/excludedCommands";

export const CommandsProbability = () => {
  const dispatch = useDispatch();
  const showFlags = useSelector(selectShowFlags);

  const comfr = useFlagValueSelector<string>("-comfr");
  const comfru = useFlagValueSelector<string>("-comfru");
  const compr = useFlagValueSelector<[string, string] | string>("-compr");
  const compru = useFlagValueSelector<[string, string] | string>("-compru");
  const recRaw = useFlagValueSelector<string>("-rec");
  const rec1 = useFlagValueSelector("-rec1");
  const rec2 = useFlagValueSelector("-rec2");
  const rec3 = useFlagValueSelector("-rec3");
  const rec4 = useFlagValueSelector("-rec4");
  const rec5 = useFlagValueSelector("-rec5");
  const rec6 = useFlagValueSelector("-rec6");

  // Determine active states
  const isCommonUnique = comfru !== undefined && comfru !== null;
  const isCommonEnabled =
    (comfr !== undefined && comfr !== null) || isCommonUnique;
  const commonRaw = comfru ?? comfr;

  const isCustomUnique = compru !== undefined && compru !== null;
  const isCustomEnabled =
    (compr !== undefined && compr !== null) || isCustomUnique;
  const customRaw = compru ?? compr;

  const excludedCommandIds = useMemo(() => {
    const list = parseExcluded(recRaw, [
      rec1,
      rec2,
      rec3,
      rec4,
      rec5,
      rec6,
    ]);
    return new Set(list);
  }, [recRaw, rec1, rec2, rec3, rec4, rec5, rec6]);

  // Common Probabilities State (Fight, Magic, Item)
  const [commonFight, commonMagic, commonItem] = useMemo(() => {
    if (!commonRaw) return [100, 100, 100];
    const parts = commonRaw.split(".").map(Number);
    return [parts[0] ?? 100, parts[1] ?? 100, parts[2] ?? 100];
  }, [commonRaw]);

  // Custom Probabilities State
  const customProbabilities = useMemo(() => {
    if (!customRaw) return [];
    const idsStr = Array.isArray(customRaw)
      ? customRaw[0]
      : customRaw.split(" ")[0];
    const percentsStr = Array.isArray(customRaw)
      ? customRaw[1]
      : customRaw.split(" ")[1];
    if (!idsStr || !percentsStr) return [];

    const ids = idsStr.split(".").map(Number);
    const percents = percentsStr.split(".").map(Number);

    return ids.map((id, idx) => ({
      commandId: id,
      percent: percents[idx] ?? 100,
    }));
  }, [customRaw]);

  // Update Common
  const updateCommon = useCallback(
    (fight: number, magic: number, item: number, minimizeRepeats?: boolean) => {
      const unique = minimizeRepeats ?? isCommonUnique;
      const targetFlag = unique ? "-comfru" : "-comfr";
      const otherFlag = unique ? "-comfr" : "-comfru";
      const value = `${fight}.${magic}.${item}`;

      dispatch(setFlag({ flag: otherFlag, value: null }));
      dispatch(setFlag({ flag: targetFlag, value }));
    },
    [isCommonUnique, dispatch],
  );

  const toggleCommon = useCallback(
    (enable: boolean) => {
      if (enable) {
        updateCommon(commonFight, commonMagic, commonItem, isCommonUnique);
      } else {
        dispatch(setFlag({ flag: "-comfr", value: null }));
        dispatch(setFlag({ flag: "-comfru", value: null }));
      }
    },
    [commonFight, commonMagic, commonItem, isCommonUnique, updateCommon, dispatch],
  );

  const toggleCommonMinimizeRepeats = useCallback(
    (minimize: boolean) => {
      if (!isCommonEnabled) return;
      updateCommon(commonFight, commonMagic, commonItem, minimize);
    },
    [isCommonEnabled, commonFight, commonMagic, commonItem, updateCommon],
  );

  // Automatically remove active probability commands from -rec exclusions
  const syncExclusions = useCallback(
    (entries: Array<{ commandId: number; percent: number }>) => {
      const activeProbabilityIds = new Set(
        entries
          .filter((e) => e.percent > 0 && e.commandId !== NONE)
          .map((e) => e.commandId),
      );

      const currentExcluded = parseExcluded(recRaw, [
        rec1,
        rec2,
        rec3,
        rec4,
        rec5,
        rec6,
      ]);
      const filtered = currentExcluded.filter(
        (id) => !activeProbabilityIds.has(id),
      );
      const hadLegacy = [rec1, rec2, rec3, rec4, rec5, rec6].some(
        (v) => v !== undefined && v !== null,
      );

      if (filtered.length !== currentExcluded.length || hadLegacy) {
        LEGACY_REC_FLAGS.forEach((flag) => {
          dispatch(setFlag({ flag, value: null }));
        });
        const newRecVal =
          filtered.length > 0
            ? filtered.map((id) => id.toString().padStart(2, "0")).join(".")
            : null;
        dispatch(setFlag({ flag: "-rec", value: newRecVal }));
      }
    },
    [recRaw, rec1, rec2, rec3, rec4, rec5, rec6, dispatch],
  );

  // Update Custom
  const updateCustom = useCallback(
    (
      entries: Array<{ commandId: number; percent: number }>,
      minimizeRepeats?: boolean,
    ) => {
      const unique = minimizeRepeats ?? isCustomUnique;
      const targetFlag = unique ? "-compru" : "-compr";
      const otherFlag = unique ? "-compr" : "-compru";

      dispatch(setFlag({ flag: otherFlag, value: null }));

      if (entries.length === 0) {
        dispatch(setFlag({ flag: targetFlag, value: null }));
        return;
      }

      // Auto-sync exclusions whenever custom probabilities update
      syncExclusions(entries);

      const idsStr = entries
        .map((e) => e.commandId.toString().padStart(2, "0"))
        .join(".");
      const percentsStr = entries.map((e) => e.percent.toString()).join(".");
      dispatch(setFlag({ flag: targetFlag, value: [idsStr, percentsStr] }));
    },
    [isCustomUnique, syncExclusions, dispatch],
  );

  const toggleCustom = useCallback(
    (enable: boolean) => {
      if (enable) {
        const declaredInCommon = isCommonEnabled
          ? new Set(COMMON_COMMANDS)
          : new Set<number>();
        const defaultCmd =
          PROBABILITY_COMMAND_IDS.find(
            (id) =>
              !excludedCommandIds.has(id) &&
              !declaredInCommon.has(id) &&
              id !== NONE,
          ) ?? MORPH;

        const initial =
          customProbabilities.length > 0
            ? customProbabilities
            : [{ commandId: defaultCmd, percent: 50 }];
        updateCustom(initial, isCustomUnique);
      } else {
        dispatch(setFlag({ flag: "-compr", value: null }));
        dispatch(setFlag({ flag: "-compru", value: null }));
      }
    },
    [
      customProbabilities,
      isCustomUnique,
      isCommonEnabled,
      excludedCommandIds,
      updateCustom,
      dispatch,
    ],
  );

  const toggleCustomMinimizeRepeats = useCallback(
    (minimize: boolean) => {
      if (!isCustomEnabled) return;
      updateCustom(customProbabilities, minimize);
    },
    [isCustomEnabled, customProbabilities, updateCustom],
  );

  const addCustomPair = useCallback(() => {
    // Pick the first available command not already in custom list
    const existingIds = new Set(customProbabilities.map((e) => e.commandId));
    const declaredInCommon = isCommonEnabled
      ? new Set(COMMON_COMMANDS)
      : new Set<number>();

    const nextCmd =
      PROBABILITY_COMMAND_IDS.find(
        (id) =>
          !existingIds.has(id) &&
          !declaredInCommon.has(id) &&
          !excludedCommandIds.has(id),
      ) ??
      PROBABILITY_COMMAND_IDS.find(
        (id) => !existingIds.has(id) && !declaredInCommon.has(id),
      );

    if (nextCmd !== undefined) {
      updateCustom(
        [...customProbabilities, { commandId: nextCmd, percent: 50 }],
        isCustomUnique,
      );
    }
  }, [
    customProbabilities,
    isCommonEnabled,
    excludedCommandIds,
    isCustomUnique,
    updateCustom,
  ]);

  const removeCustomPair = useCallback(
    (index: number) => {
      const updated = customProbabilities.filter((_, idx) => idx !== index);
      updateCustom(updated, isCustomUnique);
    },
    [customProbabilities, isCustomUnique, updateCustom],
  );

  const setCustomCommand = useCallback(
    (index: number, newCommandId: number) => {
      const updated = customProbabilities.map((item, idx) =>
        idx === index ? { ...item, commandId: newCommandId } : item,
      );
      updateCustom(updated, isCustomUnique);
    },
    [customProbabilities, isCustomUnique, updateCustom],
  );

  const setCustomPercent = useCallback(
    (index: number, percent: number) => {
      const updated = customProbabilities.map((item, idx) =>
        idx === index ? { ...item, percent } : item,
      );
      updateCustom(updated, isCustomUnique);
    },
    [customProbabilities, isCustomUnique, updateCustom],
  );

  // Helper to build options for each custom row
  const getSelectOptionsForRow = useCallback(
    (currentRowCommandId: number) => {
      const existingOtherIds = new Set(
        customProbabilities
          .map((e) => e.commandId)
          .filter((id) => id !== currentRowCommandId),
      );
      const declaredInCommon = isCommonEnabled
        ? new Set(COMMON_COMMANDS)
        : new Set<number>();

      const available = PROBABILITY_COMMAND_IDS.filter((id) => {
        if (id === currentRowCommandId) return true;
        if (existingOtherIds.has(id)) return false;
        if (declaredInCommon.has(id)) return false;
        return true;
      });

      const options = available
        .map((id) => ALL_COMMANDS[id])
        .filter(Boolean)
        .map((cmd) => ({
          value: cmd.value.toString(),
          label: cmd.label,
        }));

      return orderBy(options, ({ label }) => label);
    },
    [customProbabilities, isCommonEnabled],
  );

  return (
    <Card title={"Command & Skill Probabilities"}>
      <div className="flex flex-col gap-6">
        {/* ========================================================================= */}
        {/* 1. RANDOMIZE FIGHT / MAGIC / ITEM (-comfr / -comfru) */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-4">
            <FlagLabel
              flag={isCommonUnique ? "-comfru" : "-comfr"}
              helperText="Give every character Fight, Magic, and Item by custom chance. Unfilled slots backfill with skills."
              label="Randomize Fight/Magic/Item"
            />
            <Switch
              checked={isCommonEnabled}
              onChange={toggleCommon}
              description="Toggle Randomize Fight/Magic/Item"
            />
          </div>

          {isCommonEnabled && (
            <div className="flex flex-col gap-5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fight */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <InputLabel
                      htmlFor="comfr-fight"
                      className="!mb-0 font-semibold text-sm"
                    >
                      Fight
                    </InputLabel>
                    <span className="font-mono text-sm font-bold text-blue-500">
                      {commonFight}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={commonFight}
                    onChange={(val) =>
                      updateCommon(val as number, commonMagic, commonItem)
                    }
                  />
                  <span className="text-xs text-slate-400">
                    Gau does not roll Fight (slot backfills).
                  </span>
                </div>

                {/* Magic */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <InputLabel
                      htmlFor="comfr-magic"
                      className="!mb-0 font-semibold text-sm"
                    >
                      Magic
                    </InputLabel>
                    <span className="font-mono text-sm font-bold text-blue-500">
                      {commonMagic}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={commonMagic}
                    onChange={(val) =>
                      updateCommon(commonFight, val as number, commonItem)
                    }
                  />
                  <span className="text-xs text-slate-400">
                    Characters without Magic still keep battle MP if they know
                    spells.
                  </span>
                </div>

                {/* Item */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <InputLabel
                      htmlFor="comfr-item"
                      className="!mb-0 font-semibold text-sm"
                    >
                      Item
                    </InputLabel>
                    <span className="font-mono text-sm font-bold text-blue-500">
                      {commonItem}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={commonItem}
                    onChange={(val) =>
                      updateCommon(commonFight, commonMagic, val as number)
                    }
                  />
                  <span className="text-xs text-slate-400">
                    Chance to equip the Item menu command.
                  </span>
                </div>
              </div>

              {/* Minimize repeats checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCommonUnique}
                    onChange={(e) =>
                      toggleCommonMinimizeRepeats(e.target.checked)
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Minimize repeats
                  </span>
                  {showFlags && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({isCommonUnique ? "-comfru" : "-comfr"})
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCommon(100, 100, 100)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                      commonFight === 100 &&
                      commonMagic === 100 &&
                      commonItem === 100
                        ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                        : "bg-white dark:bg-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    100% All
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCommon(100, 0, 100)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                      commonFight === 100 &&
                      commonMagic === 0 &&
                      commonItem === 100
                        ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                        : "bg-white dark:bg-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    No Magic
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. SET RANDOM SKILL PROBABILITIES (-compr / -compru) */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-4">
            <FlagLabel
              flag={isCustomUnique ? "-compru" : "-compr"}
              helperText="Assign explicit roll chances to specific skills. Higher probability rolls claim slots first."
              label="Set random skill probabilities"
            />
            <Switch
              checked={isCustomEnabled}
              onChange={toggleCustom}
              description="Toggle Set random skill probabilities"
            />
          </div>

          {isCustomEnabled && (
            <div className="flex flex-col gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              {customProbabilities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No skill probabilities added yet. Click &quot;Add skill
                  probability&quot; below.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {customProbabilities.map((entry, idx) => {
                    const rowOptions = getSelectOptionsForRow(entry.commandId);
                    const selectedOpt = rowOptions.find(
                      (opt) => Number(opt.value) === entry.commandId,
                    ) ?? {
                      value: entry.commandId.toString(),
                      label:
                        ALL_COMMANDS[entry.commandId]?.label ??
                        `#${entry.commandId}`,
                    };

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700/70 shadow-sm"
                      >
                        {/* Dropdown for Skill */}
                        <div className="w-full sm:w-56 flex-shrink-0">
                          <Select
                            options={rowOptions}
                            value={selectedOpt}
                            onChange={(opt: SelectOption | null) => {
                              if (opt) {
                                setCustomCommand(idx, Number(opt.value));
                              }
                            }}
                          />
                        </div>

                        {/* Slider for Probability */}
                        <div className="flex-1 flex items-center gap-3 px-2">
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={entry.percent}
                            onChange={(val) =>
                              setCustomPercent(idx, val as number)
                            }
                          />
                          <span className="font-mono text-sm font-bold text-blue-500 w-12 text-right">
                            {entry.percent}%
                          </span>
                        </div>

                        {/* Minus / Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeCustomPair(idx)}
                          className="self-center sm:self-auto p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <HiMinus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Row: Add button & Minimize repeats checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={addCustomPair}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-150 active:scale-95 cursor-pointer self-start shadow-sm"
                >
                  <HiPlus className="w-4 h-4" />
                  Add skill probability
                </button>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCustomUnique}
                    onChange={(e) =>
                      toggleCustomMinimizeRepeats(e.target.checked)
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Minimize repeats
                  </span>
                  {showFlags && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({isCustomUnique ? "-compru" : "-compr"})
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
