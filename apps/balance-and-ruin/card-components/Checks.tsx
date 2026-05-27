import { Card } from "@ff6wc/ui";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";
import { BetaLabel } from "~/components/BetaLabel/BetaLabel";
import {
  FlagSubflagSelect,
  SubflagOption,
} from "~/components/FlagSubflagSelect/FlagSubflagSelect";

const MultiColumnList = ({ title, items, cols = 2 }: { title?: string; items: string[]; cols?: number }) => {
  const gridColsClass = cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
      {title && <span className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">{title}</span>}
      <div className={`grid ${gridColsClass} gap-x-2 gap-y-0.5 pl-1 text-xs text-slate-600 dark:text-slate-300`}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>{item.trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const STANDARD_IR = {
  defaultValue: "standard",
  flag: "-ir",
  helperText: () => (
    <MultiColumnList
      cols={3}
      title="Possible Item Rewards:"
      items={[
        "ValiantKnife", "Illumina", "Ragnarok", "Atma Weapon",
        "Pearl Lance", "Aura Lance", "Magus Rod", "Fixed Dice",
        "Aegis Shld", "Flame Shld", "Ice Shld", "Thunder Shld",
        "Genji Shld", "Paladin Shld", "Force Shld", "Red Cap",
        "Cat Hood", "Genji Helmet", "Force Armor", "Genji Armor",
        "Minerva", "BehemothSuit", "Snow Muffler", "Economizer",
        "Genji Glove", "Offering", "Gem Box", "Dragon Horn",
        "Marvel Shoes", "Exp. Egg"
      ]}
    />
  ),
  label: "Standard",
  isStatic: true,
};

const irOptions: SubflagOption[] = [
  {
    defaultValue: "none",
    flag: "-ir",
    helperText: () => (
      <span className="block mt-1.5 mb-2 leading-relaxed text-slate-700 dark:text-slate-200 text-xs font-medium">
        No Item Rewards are possible!
      </span>
    ),
    label: "None",
    isStatic: true,
  },
  STANDARD_IR,
  {
    defaultValue: "stronger",
    flag: "-ir",
    helperText: () => (
      <MultiColumnList
        cols={3}
        title="Possible High Tier Item Rewards:"
        items={[
          "ValiantKnife", "Illumina", "Ragnarok", "Atma Weapon",
          "Aura Lance", "Fixed Dice", "Flame Shld", "Ice Shld",
          "Thunder Shld", "Paladin Shld", "Force Shld", "Minerva",
          "BehemothSuit", "Snow Muffler", "Genji Glove", "Offering",
          "Dragon Horn", "Exp. Egg"
        ]}
      />
    ),
    label: "Stronger",
    isStatic: true,
  },
  {
    defaultValue: "premium",
    flag: "-ir",
    helperText: () => (
      <MultiColumnList
        cols={3}
        title="Possible High Tier Item Rewards:"
        items={[
          "ValiantKnife", "Illumina", "Ragnarok", "Atma Weapon",
          "Fixed Dice", "Flame Shld", "Ice Shld", "Thunder Shld",
          "Paladin Shld", "Minerva", "Genji Glove", "Offering",
          "Exp. Egg"
        ]}
      />
    ),
    label: "Premium",
    isStatic: true,
  },
];

export const Checks = () => {
  return (
    <Card title={"Checks"}>
      <div className="flex flex-col gap-6 w-full h-full">
        <div className="flex flex-col gap-2">
          <FlagSwitch
            flag="-nfce"
            label="No Free Characters/Espers"
            helperText={
              <MultiColumnList
                cols={2}
                title="Remove character/esper rewards from:"
                items={[
                  "Auction House", "Collapsing House", "Figaro Castle Throne",
                  "Gau's Father's House", "Kohlingen Inn", "Narshe Weapon Shop",
                  "Sealed Gate", "South Figaro Basement", "Lone Wolf"
                ]}
              />
            }
          />
        </div>

        <div className="border-t border-white/10 pt-4 flex-1">
          <FlagSubflagSelect
            defaultSelected={STANDARD_IR}
            label={<>Item Rewards</>}
            options={irOptions}
          />
        </div>
      </div>
    </Card>
  );
};
