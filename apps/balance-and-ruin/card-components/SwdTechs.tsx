import { Card } from "@ff6wc/ui";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";


export const SwdTechs = () => {
  return (
    <Card title={"SwdTech"}>
      <div className="flex flex-col gap-6">
        <FlagSwitch flag="-fst" label="Fast SwdTech" />
        <FlagSwitch flag="-sel" label="Everyone Learns" />



        <FlagSwitch
          flag="-fr"
          invert
          label="Restore Retort Glitch"
          helperText="Restore glitch where Retort can counter various actions infinitely using the Imp status"
        />
      </div>
    </Card>
  );
};
