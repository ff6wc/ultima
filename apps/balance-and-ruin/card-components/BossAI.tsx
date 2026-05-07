import { Card, Divider, HelperText } from "@ff6wc/ui";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagRange } from "~/components/FlagRange/FlagRange";
import { FlagSwitch } from "~/components/FlagSwitch/FlagSwitch";

export const BossAI = () => {
  return (
    <Card title={"Boss Restoration"}>
      <CardColumn>
        <HelperText>
          Revert balance changes that have been made over time for Worlds
          Collide
        </HelperText>

        <FlagSwitch
          flag="-bnu"
          helperText="Bosses that were undead in the original game are now undead"
          invert
          label="Restore Undead Bosses"
        />

        <Divider />
        <FlagSwitch
          flag="-cmd"
          invert
          helperText="Chadarnook will spend less time in demon form"
          label="Chadarnook Less Demon"
        />
        <FlagSwitch
          flag="-dgne"
          invert
          helperText="Doom gaze will escape during the fight"
          label=" Doom Gaze Escapes"
        />

        <FlagSwitch
          flag="-mmnu"
          invert
          helperText="MagiMaster will cast Ultima on death"
          label="MagiMaster Casts Ultima on Death"
        />

        <FlagSwitch
          flag="-wnz"
          invert
          helperText="Wrexsoul will cast Zinger throughout the battle"
          label="Wrexsoul Casts Zinger"
        />

        <FlagRange
          flag={"-rt"}
          helperText="Range for the number of seconds befor Rizopas will appear"
          label={"Rizopas Timer"}
        />
      </CardColumn>
    </Card>
  );
};
