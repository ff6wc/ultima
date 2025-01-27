import { Card } from "@ff6wc/ui";
import { useDispatch } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { FlagNumberInput } from "~/components/FlagNumberInput/FlagNumberInput";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { StartingItemSelect } from "~/components/StartingItemSelect/StartingItemSelect";
import { StartingItemsAddItemButton } from "~/components/StartingItemsAddItemButton/StartingItemsAddItemButton";
import { setFlag } from "~/state/flagSlice";
import {
  setItems,
} from "~/state/itemSlice";
import { StartingItems } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";

type StartingItemsProps = {
  items: StartingItems;
  curateItems: boolean;
};

export const StartingGoldAndItems = ({ items, curateItems }: StartingItemsProps) => {
  const dispatch = useDispatch();

  const onItemChange = (items: StartingItems) => {
    const sits = startingItemsToString;
    dispatch(setItems(items));
    dispatch(
      setFlag({
        flag: "-si",
        value: sits(items),
      })
    );
  };

  const actions = (
    <div className="flex flex-row flex-wrap gap-2 items-center justify-between p-2 bg-zinc-800 ">
      <StartingItemsAddItemButton items={items} />
    </div>
  );

  return (
    <Card prependedComponent={actions} title={"Starting Gold/Items"}>
      <CardColumn>
        <FlagNumberInput
          description="Begin the game with {{ . }} gold"
          flag="-gp"
          label="Starting Gold"
          type="int"
        />

        <FlagSlider
          flag="-smc"
          helperText="Begin the game with {{ . }} Moogle Charms"
          label="(Old Style) Starting Moogle Charms"
        />
        <FlagSlider
          helperText="Begin the game with {{ . }} Warp Stones"
          flag="-sws"
          label="(Old Style) Starting Warp Stones"
        />
        <FlagSlider
          helperText="Begin the game with {{ . }} Fenix Downs"
          flag="-sfd"
          label="(Old Style) Starting Fenix Downs"
        />

        <div className={"flex justify-between items-center gap-4"}>
          <FlagLabel
            flag={"-si"}
            helperText={"The dropdown menus support searching for items"}
            label={"Starting Items"}
          />
        </div>
        <div className={"max-h-96 overflow-y-auto overflow-x-auto"}>
          <div className={"max-w-md"}>
            {items.items.map((i, idx) => (
              <StartingItemSelect
                item={i}
                key={idx}
                items={items}
                curateItems={curateItems}
                onChange={onItemChange}
              />
            ))}
          </div>
        </div>
      </CardColumn>
    </Card>
  );
};
