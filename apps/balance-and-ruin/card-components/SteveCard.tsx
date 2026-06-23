import { Card, Input } from "@ff6wc/ui";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { setFlag, useFlagValueSelector } from "~/state/flagSlice";
import { selectDefaultValue, selectDescription } from "~/state/schemaSlice";
import { renderDescription } from "~/utils/renderDescription";
import { hasSevereProfanity } from "~/utils/profanity";

export const SteveCard = () => {
  const flag = "-steve";
  const ref = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const defaultValue = useSelector(selectDefaultValue(flag));
  const schemaDescription = useSelector(selectDescription(flag));
  const reduxValue = useFlagValueSelector<string>(flag) ?? defaultValue?.toString() ?? "";

  const [localValue, setLocalValue] = useState(reduxValue);
  const [error, setError] = useState<string | null>(null);

  // Track the last value dispatched from this component to differentiate
  // between user typing and external state updates (presets, default resets, etc.)
  const lastDispatchedValueRef = useRef<string | null>(reduxValue || null);

  // Sync local input value with Redux store when Redux store value changes from elsewhere
  useEffect(() => {
    const expectedReduxValue = lastDispatchedValueRef.current ?? "";
    if (reduxValue !== expectedReduxValue) {
      setLocalValue(reduxValue);
      if (hasSevereProfanity(reduxValue)) {
        setError("Inappropriate language detected.");
      } else {
        setError(null);
      }
      lastDispatchedValueRef.current = reduxValue || null;
    }
  }, [reduxValue]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (hasSevereProfanity(newValue)) {
      setError("Inappropriate language detected.");
      lastDispatchedValueRef.current = null;
      // Do not dispatch profanity to Redux (clear it so it doesn't get generated/shared)
      dispatch(
        setFlag({
          flag,
          value: null,
        }),
      );
    } else {
      setError(null);
      lastDispatchedValueRef.current = newValue;
      dispatch(
        setFlag({
          flag,
          value: newValue ? newValue : null,
        }),
      );
    }
  };

  return (
    <Card
      title="STEVE!"
      className="!border-red-900/40 !bg-gradient-to-br !from-red-950/20 !to-red-950/5 dark:!from-red-950/30 dark:!to-slate-900/10 shadow-lg shadow-red-950/10 [&>div:first-child]:!bg-red-950/40 [&>div:first-child]:!border-red-900/30 [&>div:first-child]:!text-red-400"
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <FlagLabel
              flag={flag}
              helperText={renderDescription(
                schemaDescription || "Rename all characters, items, espers, magic, enemies, etc. to a given name.",
                localValue,
              )}
              label="Steveify"
            />

            <Input
              className={`w-full ${error ? "!border-red-500 focus:!border-red-500" : ""}`}
              onChange={(e) => handleChange(e.target.value)}
              ref={ref}
              placeholder="Steve"
              type="text"
              value={localValue}
            />

            {error ? (
              <span className="text-xs text-red-500 dark:text-red-400 font-semibold mt-1">
                {error}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};
