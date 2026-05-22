import { Card } from "@ff6wc/ui";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagRange } from "~/components/FlagRange/FlagRange";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import {
  FlagSubflagSelect,
  SubflagOption,
} from "~/components/FlagSubflagSelect/FlagSubflagSelect";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";
import { Divider } from "@ff6wc/ui/Divider/Divider";
import { BetaLabel } from "~/components/BetaLabel/BetaLabel";

const opponentOptions: SubflagOption[] = [
  {
    defaultValue: 100,
    flag: "-cor",
    helperText: "Coliseum opponents original with a given percent randomized",
    label: "Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-cor" label={children} helperText="" />
    ),
  },
  {
    defaultValue: 0,
    flag: "-cosr",
    helperText: "Coliseum opponents shuffled and then given percent randomized",
    label: "Shuffle + Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-cosr" label={children} helperText="" />
    ),
  },
];

const rewardOptions: SubflagOption[] = [
  {
    defaultValue: 100,
    flag: "-crr",
    helperText: "Coliseum rewards original with a given percent randomized",
    label: "Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-crr" label={children} helperText="" />
    ),
  },
  {
    defaultValue: 0,
    flag: "-crsr",
    helperText: "Coliseum rewards shuffled and then a given percent randomized",
    label: "Shuffle + Random",
    Renderable: ({ children }) => (
      <FlagSlider flag="-crsr" label={children} helperText="" />
    ),
  },
];

const visibleRewardsOptions: SubflagOption[] = [
  {
    defaultValue: [255, 255],
    flag: "-crvr",
    helperText:
      "Percent of Coliseum rewards visible in the item selection menu",
    label: "Random",
    Renderable: ({ children }) => (
      <FlagRange flag="-crvr" label={children} helperText="" />
    ),
  },
];

export const Coliseum = () => {
  return (
    <Card title={"Coliseum"}>
      <div className="flex flex-col gap-6 h-full">
        {/* Row 1: Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-slate-200 dark:md:divide-slate-700">
          <div className="md:pr-6">
            <FlagSubflagSelect
              options={opponentOptions}
              label={"Opponents"}
              nullable={{ description: "", label: "Original" }}
              descriptionClassName="md:min-h-[80px]"
            />
          </div>

          <div className="md:px-6">
            <FlagSubflagSelect
              options={rewardOptions}
              label={"Rewards"}
              nullable={{ description: "", label: "Original" }}
              descriptionClassName="md:min-h-[80px]"
            />
          </div>

          <div className="md:pl-6">
            <FlagSubflagSelect
              options={visibleRewardsOptions}
              label={"Visible Rewards"}
              nullable={{
                description:
                  "Percent of Coliseum rewards visible in the item selection menu",
                label: "Original",
              }}
              descriptionClassName="md:min-h-[80px]"
            />
          </div>
        </div>

        {/* Row 2: Perfectly Aligned Switches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-slate-200 dark:md:divide-slate-700 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="md:pr-6">
            <FlagSwitch flag="-crm" label="Rewards Menu" />
          </div>
          <div className="md:px-6">
            <FlagSwitch flag="-cnee" label="No Exp. Egg" />
          </div>
          <div className="md:pl-6">
            <FlagSwitch flag="-cnil" label="No Illumina" />
          </div>
        </div>
      </div>
    </Card>
  );
};
