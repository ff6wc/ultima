import {
  ALL_COMMANDS,
  EXCLUDABLE_COMMAND_IDS,
  NONE,
  POSSESS,
  SHOCK,
} from "@ff6wc/ff6-types";
import { Button, Card } from "@ff6wc/ui";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { setFlag, useFlagValueSelector } from "~/state/flagSlice";

export const CommandsExcluded = () => {
  const dispatch = useDispatch();

  const recRaw = useFlagValueSelector<string>("-rec");
  const rec1 = useFlagValueSelector("-rec1");
  const rec2 = useFlagValueSelector("-rec2");
  const rec3 = useFlagValueSelector("-rec3");
  const rec4 = useFlagValueSelector("-rec4");
  const rec5 = useFlagValueSelector("-rec5");
  const rec6 = useFlagValueSelector("-rec6");

  // Read active probability commands to prevent conflicts
  const compr = useFlagValueSelector<[string, string] | string>("-compr");
  const compru = useFlagValueSelector<[string, string] | string>("-compru");

  const probabilityCommandIds = useMemo(() => {
    const prValue = compr ?? compru;
    if (!prValue) return new Set<number>();
    const idsStr = Array.isArray(prValue) ? prValue[0] : prValue.split(" ")[0];
    const percentsStr = Array.isArray(prValue)
      ? prValue[1]
      : prValue.split(" ")[1];
    if (!idsStr || !percentsStr) return new Set<number>();

    const ids = idsStr.split(".").map(Number);
    const percents = percentsStr.split(".").map(Number);
    const active = new Set<number>();

    ids.forEach((id, idx) => {
      if (percents[idx] > 0 && id !== NONE) {
        active.add(id);
      }
    });
    return active;
  }, [compr, compru]);

  // Combine -rec and legacy -rec1..-rec6
  const excludedCommands = useMemo(() => {
    if (recRaw !== undefined && recRaw !== null) {
      if (!recRaw) return [];
      return recRaw
        .split(".")
        .map(Number)
        .filter((val) => !isNaN(val) && val !== NONE);
    }
    return [rec1, rec2, rec3, rec4, rec5, rec6]
      .map(Number)
      .filter((val) => !isNaN(val) && val !== NONE);
  }, [recRaw, rec1, rec2, rec3, rec4, rec5, rec6]);

  const sortedExcludables = useMemo(() => {
    const list = EXCLUDABLE_COMMAND_IDS.map((id) => ALL_COMMANDS[id]).filter(
      Boolean,
    );
    return orderBy(list, ({ label }) => label);
  }, []);

  const syncProbabilities = (newExcluded: number[]) => {
    const excludedSet = new Set(newExcluded);
    const prFlag =
      compru !== undefined && compru !== null ? "-compru" : "-compr";
    const prValue = compru ?? compr;

    if (prValue) {
      const idsStr = Array.isArray(prValue)
        ? prValue[0]
        : prValue.split(" ")[0];
      const percentsStr = Array.isArray(prValue)
        ? prValue[1]
        : prValue.split(" ")[1];

      if (idsStr && percentsStr) {
        const ids = idsStr.split(".").map(Number);
        const percents = percentsStr.split(".").map(Number);

        const remainingEntries = ids
          .map((id, idx) => ({ id, percent: percents[idx] }))
          .filter(({ id }) => !excludedSet.has(id));

        if (remainingEntries.length === 0) {
          dispatch(setFlag({ flag: "-compr", value: null }));
          dispatch(setFlag({ flag: "-compru", value: null }));
        } else if (remainingEntries.length !== ids.length) {
          const newIdsStr = remainingEntries
            .map((e) => e.id.toString().padStart(2, "0"))
            .join(".");
          const newPercentsStr = remainingEntries
            .map((e) => e.percent.toString())
            .join(".");
          dispatch(
            setFlag({ flag: prFlag, value: [newIdsStr, newPercentsStr] }),
          );
        }
      }
    }
  };

  const updateExclusions = (newExcluded: number[]) => {
    // Clear legacy flags if any exist
    ["-rec1", "-rec2", "-rec3", "-rec4", "-rec5", "-rec6"].forEach((flag) => {
      dispatch(setFlag({ flag, value: null }));
    });

    // Auto-sync custom probabilities to prevent overlap conflicts at gen time
    syncProbabilities(newExcluded);

    if (newExcluded.length === 0) {
      dispatch(setFlag({ flag: "-rec", value: null }));
    } else {
      const formatted = newExcluded
        .map((id) => id.toString().padStart(2, "0"))
        .join(".");
      dispatch(setFlag({ flag: "-rec", value: formatted }));
    }
  };

  const toggleCommand = (id: number) => {
    if (excludedCommands.includes(id)) {
      updateExclusions(excludedCommands.filter((val) => val !== id));
    } else {
      // Ensure at least one excludable command remains available for random selection
      if (excludedCommands.length >= EXCLUDABLE_COMMAND_IDS.length - 1) {
        return;
      }
      updateExclusions([...excludedCommands, id]);
    }
  };

  const setStandard = () => {
    updateExclusions([POSSESS, SHOCK]);
  };

  const clearAll = () => {
    updateExclusions([]);
  };

  return (
    <Card title={"Excluded Commands"}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <FlagLabel
            flag="-rec"
            helperText={
              "Commands selected below will be excluded from all random and unique command drafting."
            }
            label={"Random Exclusions (-rec)"}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={setStandard}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Standard (Possess, Shock)
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={excludedCommands.length === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {sortedExcludables.map((cmd) => {
            const isExcluded = excludedCommands.includes(cmd.value);
            const hasConflict = probabilityCommandIds.has(cmd.value);

            return (
              <button
                key={cmd.value}
                type="button"
                onClick={() => toggleCommand(cmd.value)}
                title={
                  isExcluded
                    ? `Click to remove ${cmd.label} from exclusions`
                    : hasConflict
                      ? `Click to exclude ${cmd.label} (will remove from custom probability list)`
                      : `Click to exclude ${cmd.label}`
                }
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left cursor-pointer active:scale-95 ${
                  isExcluded
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400 font-semibold shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="truncate">{cmd.label}</span>
                {isExcluded && (
                  <span className="ml-1.5 flex h-2 w-2 relative flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
                {!isExcluded && hasConflict && (
                  <span
                    className="text-xs text-amber-500 font-normal ml-1"
                    title="Currently assigned a custom probability roll"
                  >
                    %
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {excludedCommands.length > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              <strong>{excludedCommands.length}</strong> command
              {excludedCommands.length === 1 ? "" : "s"} excluded
            </span>
            <span className="font-mono text-slate-400">
              -rec{" "}
              {excludedCommands
                .map((id) => id.toString().padStart(2, "0"))
                .join(".")}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

