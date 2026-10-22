import { FlagValue } from "~/state/schemaSlice";

const SPECIAL_FLAG_REGEX =
  /^-(com|cspr|cpal|cpor|cspp|name|rls|ir|si|rec|comfr|comfru|steve|oops)$/;
const MULTI_ARG_STRING_FLAG_REGEX = /^-(compr|compru)$/;
const OBJECTIVE_REGEX = /^(-o[a-z])$/;
const STARTING_ITEMS_REGEX = /^(-si)$/;
/** Flags whose value is a space-separated list of strings (e.g. `-rc terra locke`) */
const STRING_LIST_REGEX = /^(-rc)$/;
/** Values the generator uses when these flags are given without one (argparse `const`) */
const OPTIONAL_VALUE_DEFAULTS: Record<string, string> = {
  "-oops": "random",
  "-steve": "Steve",
};

var FLAG_START_REGEX = /-(?=[a-z])/g;

export const flagsToData = (rawFlags: string): Record<string, FlagValue> => {
  const flags = rawFlags
    .split(FLAG_START_REGEX)
    .filter((flag) => flag)
    .map((flag) => `-${flag.trim()}`);

  return flags.reduce(
    (acc, flagWithValue) => {
      const [key, val1, val2] = flagWithValue.split(" ");
      const isMultiArgString = MULTI_ARG_STRING_FLAG_REGEX.test(key);
      const isCommands = SPECIAL_FLAG_REGEX.test(key);
      const isObjective = OBJECTIVE_REGEX.test(key);

      if (STRING_LIST_REGEX.test(key)) {
        acc[key] = flagWithValue.split(" ").slice(1).filter(Boolean);
      } else if (isMultiArgString) {
        if (val1 && val2) {
          acc[key] = [val1, val2];
        } else if (val1) {
          acc[key] = val1;
        }
      } else if (isObjective || isCommands) {
        // checked before the number-array branch: these take one string value,
        // so a second token must not turn the value into [NaN, NaN]
        acc[key] = val1 ?? OPTIONAL_VALUE_DEFAULTS[key];
      } else if (val1 && val2) {
        // is number array
        const min = Number.parseFloat(val1);
        const max = Number.parseFloat(val2);
        acc[key] = [min, max];
      } else if (Number.isFinite(Number.parseFloat(val1))) {
        acc[key] = Number.parseFloat(val1);
      } else if (val1) {
        acc[key] = val1;
      } else {
        acc[key] = true;
      }
      return acc;
    },
    {} as Record<string, FlagValue>,
  );
};

export const objectivesToData = (rawFlags: string): Record<string, string> => {
  const flags = rawFlags
    .split(FLAG_START_REGEX)
    .filter((flag) => flag)
    .map((flag) => `-${flag.trim()}`);

  return flags.reduce(
    (acc, flagWithValue) => {
      const [key, val1, val2] = flagWithValue.split(" ");
      const isObjective = OBJECTIVE_REGEX.test(key);

      // is number array
      if (!isObjective) {
        return acc;
      }
      acc[key] = val1;
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const startingItemsToData = (
  rawFlags: string,
): Record<string, string> => {
  const flags = rawFlags
    .split(FLAG_START_REGEX)
    .filter((flag) => flag)
    .map((flag) => `-${flag.trim()}`);

  return flags.reduce(
    (acc, flagWithValue) => {
      const [key, val1] = flagWithValue.split(" ");
      const isStartingItem = STARTING_ITEMS_REGEX.test(key);

      if (!isStartingItem) {
        return acc;
      }
      acc[key] = val1;
      return acc;
    },
    {} as Record<string, string>,
  );
};
