import { FlagValue } from "~/state/schemaSlice";

const SPECIAL_FLAG_REGEX =
  /^-(com|cspr|cpal|cpor|cspp|name|rls|ir|si|rec|comfr|comfru)$/;
const MULTI_ARG_STRING_FLAG_REGEX = /^-(compr|compru)$/;
const OBJECTIVE_REGEX = /^(-o[a-z])$/;
const STARTING_ITEMS_REGEX = /^(-si)$/;

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

      if (isMultiArgString) {
        if (val1 && val2) {
          acc[key] = [val1, val2];
        } else if (val1) {
          acc[key] = val1;
        }
      } else if (val1 && val2) {
        const min = Number.parseFloat(val1);
        const max = Number.parseFloat(val2);
        acc[key] = [min, max];
      } else if (isObjective || isCommands) {
        acc[key] = val1;
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
