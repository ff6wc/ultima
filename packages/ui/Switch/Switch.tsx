import { Switch as BaseSwitch } from "@headlessui/react";
import { cva } from "cva";

const switchStyles = cva(
  [
    "relative inline-flex h-4 w-8 items-center border-1 rounded-full",
    "focus-visible:shadow-switch-focus",
    "focus-visible:outline-1 outline-black",
  ],
  {
    variants: {
      checked: {
        true: "bg-blue-400 border-blue-400 dark:border-gray-600",
        false: "bg-inputs-background border-inputs-border",
      },
    },
  }
);

const buttonStyles = cva(
  ["inline-block h-5 w-5 transform bg-black transition rounded-full shadow-sm"],
  {
    variants: {
      checked: {
        true: "translate-x-4 bg-white",
        false: "translate-x-0 bg-zinc-400",
      },
    },
  }
);

export type SwitchProps = {
  checked?: boolean;
  description?: string;
  onChange?: (checked: boolean) => void;
};

export const Switch = ({ checked, description, onChange }: SwitchProps) => {
  return (
    <BaseSwitch
      checked={checked}
      onChange={onChange}
      className={switchStyles({ checked })}
    >
      <span className="sr-only">{description}</span>
      <span className={buttonStyles({ checked })} />
    </BaseSwitch>
  );
};
