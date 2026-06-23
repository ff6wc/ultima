import { Card } from "@ff6wc/ui";
import { FlagSubflagSelect } from "~/components/FlagSubflagSelect/FlagSubflagSelect";
import { FlagSelect } from "~/components/FlagSelect/FlagSelect";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";
import { Divider } from "@ff6wc/ui/Divider/Divider";

const battleOptions = [
  {
    defaultValue: true,
    flag: "-bbs",
    helperText: "Boss battles are shuffled (No repeats)",
    label: "Shuffled",
    isStatic: true,
  },
  {
    defaultValue: true,
    flag: "-bbr",
    helperText: "Boss battles are randomized (Possible repeats)",
    label: "Random",
    isStatic: true,
  },
];

const SHUFFLE_DRAGONS = {
  defaultValue: "shuffle",
  flag: "-drloc",
  helperText: "Dragons battles are shuffled amongst themselves",
  label: "Shuffled",
  isStatic: true,
};
const dragonOptions = [
  {
    defaultValue: "original",
    flag: "-drloc",
    helperText: "Dragons battles are unchanged",
    label: "Original",
    isStatic: true,
  },
  SHUFFLE_DRAGONS,
  {
    defaultValue: "mix",
    flag: "-drloc",
    helperText:
      "Dragons are added to the general boss pool. If boss battles are original, they will shuffle amongst themselves",
    label: "Mixed",
    isStatic: true,
  },
];

const MIX_STATUES = {
  defaultValue: "mix",
  flag: "-stloc",
  helperText:
    "Doom, Goddess, and Poltrgeist are mixed into the general boss pool. If boss battles are original, they will shuffle amongst themselves",
  label: "Mixed",
  isStatic: true,
};
const statueOptions = [
  {
    defaultValue: "original",
    flag: "-stloc",
    helperText:
      "Doom, Goddess, and Poltrgeist are fought in their original locations",
    label: "Original",
    isStatic: true,
  },
  {
    defaultValue: "shuffle",
    flag: "-stloc",
    helperText: "Doom, Goddess, and Poltrgeist are shuffled amongst themselves",
    label: "Shuffled",
    isStatic: true,
  },
  MIX_STATUES,
];

const oopsOptions = [
  { value: "random", label: "Random" },
  { value: "Air Force", label: "Air Force" },
  { value: "Atma", label: "Atma" },
  { value: "AtmaWeapon", label: "AtmaWeapon" },
  { value: "BL Tentacle", label: "BL Tentacle" },
  { value: "BR Tentacle", label: "BR Tentacle" },
  { value: "Blue Drgn", label: "Blue Drgn" },
  { value: "Chadarnook (Demon)", label: "Chadarnook (Demon)" },
  { value: "Chadarnook (Painting)", label: "Chadarnook (Painting)" },
  { value: "Chupon", label: "Chupon" },
  { value: "Curley", label: "Curley" },
  { value: "Dadaluma", label: "Dadaluma" },
  { value: "Dirt Drgn", label: "Dirt Drgn" },
  { value: "Doom", label: "Doom" },
  { value: "Doom Gaze", label: "Doom Gaze" },
  { value: "Dullahan", label: "Dullahan" },
  { value: "FlameEater", label: "FlameEater" },
  { value: "GhostTrain", label: "GhostTrain" },
  { value: "Goddess", label: "Goddess" },
  { value: "Gold Drgn", label: "Gold Drgn" },
  { value: "Guardian", label: "Guardian" },
  { value: "Head", label: "Head" },
  { value: "Hidon", label: "Hidon" },
  { value: "Hidonite1", label: "Hidonite1" },
  { value: "Hidonite2", label: "Hidonite2" },
  { value: "Hidonite3", label: "Hidonite3" },
  { value: "Hidonite4", label: "Hidonite4" },
  { value: "Ice Dragon", label: "Ice Dragon" },
  { value: "Ifrit", label: "Ifrit" },
  { value: "Inferno", label: "Inferno" },
  { value: "Ipooh", label: "Ipooh" },
  { value: "KatanaSoul", label: "KatanaSoul" },
  { value: "Kefka (Final)", label: "Kefka (Final)" },
  { value: "Kefka (Narshe)", label: "Kefka (Narshe)" },
  { value: "Larry", label: "Larry" },
  { value: "Laser Gun", label: "Laser Gun" },
  { value: "Leader", label: "Leader" },
  { value: "Left Blade", label: "Left Blade" },
  { value: "Left Crane", label: "Left Crane" },
  { value: "MagiMaster", label: "MagiMaster" },
  { value: "Marshal", label: "Marshal" },
  { value: "MissileBay", label: "MissileBay" },
  { value: "Moe", label: "Moe" },
  { value: "Naughty", label: "Naughty" },
  { value: "Nerapa", label: "Nerapa" },
  { value: "Number 024", label: "Number 024" },
  { value: "Number 128", label: "Number 128" },
  { value: "Phunbaba 3", label: "Phunbaba 3" },
  { value: "Phunbaba 4", label: "Phunbaba 4" },
  { value: "Piranha", label: "Piranha" },
  { value: "Poltrgeist", label: "Poltrgeist" },
  { value: "Presenter", label: "Presenter" },
  { value: "Red Dragon", label: "Red Dragon" },
  { value: "Right Blade", label: "Right Blade" },
  { value: "Right Crane", label: "Right Crane" },
  { value: "Rizopas", label: "Rizopas" },
  { value: "Rough", label: "Rough" },
  { value: "Shiva", label: "Shiva" },
  { value: "Skull Drgn", label: "Skull Drgn" },
  { value: "SoulSaver", label: "SoulSaver" },
  { value: "Speck", label: "Speck" },
  { value: "SrBehemoth", label: "SrBehemoth" },
  { value: "Storm Drgn", label: "Storm Drgn" },
  { value: "Striker", label: "Striker" },
  { value: "TL Tentacle", label: "TL Tentacle" },
  { value: "TR Tentacle", label: "TR Tentacle" },
  { value: "Tritoch", label: "Tritoch" },
  { value: "TunnelArmr", label: "TunnelArmr" },
  { value: "Ultros 1", label: "Ultros 1" },
  { value: "Ultros 2", label: "Ultros 2" },
  { value: "Ultros 3", label: "Ultros 3" },
  { value: "Ultros 4", label: "Ultros 4" },
  { value: "Umaro", label: "Umaro" },
  { value: "Vargas", label: "Vargas" },
  { value: "Whelk", label: "Whelk" },
  { value: "White Drgn", label: "White Drgn" },
  { value: "Wrexsoul", label: "Wrexsoul" },
];

export const Bosses = () => {
  return (
    <Card title={"Bosses"}>
      <div className="flex flex-col gap-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FlagSubflagSelect
            className="h-full justify-between"
            nullable={{
              description: "Boss battles are unchanged",
              label: "Original",
            }}
            label="Boss Battles"
            options={battleOptions}
          />
          <FlagSubflagSelect
            className="h-full justify-between"
            defaultSelected={MIX_STATUES}
            label="Statue Battles"
            options={statueOptions}
          />
          <FlagSubflagSelect
            className="h-full justify-between"
            defaultSelected={SHUFFLE_DRAGONS}
            label="Dragon Battles"
            options={dragonOptions}
          />
        </div>

        <div className="border-t border-white/10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FlagSelect
            flag="-oops"
            label="Oops All Boss"
            options={oopsOptions}
            nullable
            nullableLabel="Disabled"
          />
          <FlagSwitch
            flag="-who"
            helperText={"Bosses look like Imps and have the name '??????'"}
            label="Who's There?"
          />
        </div>

        {/* 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto pt-4">
          (LEGACY) Flag -bmbd hidden per user request
          <FlagSwitch
            flag="-bmbd"
            label="Shuffle Bosses & Dragons Together"
            helperText="Shuffle/randomize bosses and dragons together"
          />
          <FlagRange
            flag="-rt"
            label="Rizopas Timer"
            helperText="Custom range for seconds before Rizopas will appear"
            min={5}
            max={60}
          />
        </div>
        */}
      </div>
    </Card>
  );
};
