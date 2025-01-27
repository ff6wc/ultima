import { Card } from "@ff6wc/ui";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import {
  FlagSubflagSelect,
  SubflagOption,
} from "~/components/FlagSubflagSelect/FlagSubflagSelect";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { BetaLabel } from "~/components/BetaLabel/BetaLabel";
import { FlagRange } from "~/components/FlagRange/FlagRange";

const stealOptions: SubflagOption[] = [
  {
    defaultValue: true,
    flag: "-sch",
    label: "Higher",
    helperText: "Steal rate is improved and rare steals are more likely",
    Renderable: null,
  },
  {
    defaultValue: true,
    flag: "-sca",
    label: "Always",
    helperText: "Steal will always succeed if an enemy has an item",
    Renderable: null,
  },
];

const stealRandomOptions: SubflagOption[] = [
  {
    defaultValue: 10,
    flag: "-ss",
    helperText: "Shuffle Items Stolen with given percent randomized",
    label: "Shuffle + Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-ss" helperText="" label={children} />
    ),
  }
];

const dropRandomOptions: SubflagOption[] = [
  {
    defaultValue: 10,
    flag: "-sd",
    helperText: "Shuffle Items Dropped with given percent randomized",
    label: "Shuffle + Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-sd" helperText="" label={children} />
    ),
  }
];

export const StealCapture = () => {
  return (
    <Card title={"Steal/Capture"}>
      <CardColumn>
        <FlagSubflagSelect
          label="Chance to Steal"
          nullable={{
            label: "Original",
            description: "Original steal changes",
          }}
          options={stealOptions}
        />

        <FlagSwitch
          flag="-fc"
          helperText="When enabled, multi-steal can give more than one item, and weapon specials can now proc using the Capture command"
          label="Fix Capture Bugs"
        />

        <FlagSubflagSelect
          options={stealRandomOptions}
          nullable={{
            description: "Steals are original",
            label: "Original",
          }}
          label="Steals"
        />

        <FlagSubflagSelect
          options={dropRandomOptions}
          nullable={{
            description: "Drops are original",
            label: "Original",
          }}
          label="Drops"
        />
      </CardColumn>
    </Card>
  );
};
