import { Button, Card, Input } from "@ff6wc/ui";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { setRawFlags } from "~/state/flagSlice";
import { setRawObjectives } from "~/state/objectiveSlice";
import { setRawStartingItems } from "~/state/itemSlice";

export const FlagsCard = () => {
  const [flags, setFlags] = useState("");
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(setRawFlags(flags));
    dispatch(setRawObjectives(flags));
    dispatch(setRawStartingItems(flags));
  };

  return (
    <Card title={"Enter Flags"}>
      <CardColumn>
        <div>
          <FlagLabel
            flag="-manualflagstring"
            helperText="Enter own flagstring below and click 'Set Flags' to update the active flags"
            label={""}
          />
        </div>
        <div className={"flex gap-4"}>
          <Input
            className={"flex-grow"}
            onChange={(e) => setFlags(e.target.value)}
          />
          <Button onClick={onClick} variant="primary">
            Set Flags
          </Button>
        </div>
      </CardColumn>
    </Card>
  );
};
