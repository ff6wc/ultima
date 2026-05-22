import { Card } from "@ff6wc/ui";
import { useDispatch, useSelector } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { FlagNumberInput } from "~/components/FlagNumberInput/FlagNumberInput";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { FlagTextInput } from "~/components/FlagInput/FlagInput";
import { setFlag } from "~/state/flagSlice";
import { selectStartingItems, setItems } from "~/state/itemSlice";
import { StartingItem, StartingItems } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";
import { StartingItemsAddItemButton } from "~/components/StartingItemsAddItemButton/StartingItemsAddItemButton";
import { StartingItemSelect } from "~/components/StartingItemSelect/StartingItemSelect";

export interface StartingItemsProps {
  items?: StartingItems;
  curateItems?: boolean;
}

export const StartingGoldAndItems = ({ items: propsItems, curateItems = false }: StartingItemsProps) => {
  const dispatch = useDispatch();
  const reduxItems = useSelector(selectStartingItems);
  const items = propsItems ?? reduxItems;

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

  return (
    <Card title={"Starting Gold/Items"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left Column: Sliders and numeric options */}
        <div className="flex flex-col gap-6">
          <FlagNumberInput
            description="Begin the game with {{ . }} gold"
            flag="-gp"
            label="Starting Gold"
            type="int"
          />

          <FlagSlider
            flag="-smc"
            helperText="Begin the game with {{ . }} Moogle Charms"
            label="Starting Moogle Charms"
          />

          <FlagSlider
            helperText="Begin the game with {{ . }} Fenix Downs"
            flag="-sfd"
            label="Starting Fenix Downs"
          />
          
          <FlagSlider
            helperText="Begin the game with {{ . }} Warp Stones"
            flag="-sws"
            label="Starting Warp Stones"
          />

          <FlagSlider
            helperText="Begin the game with {{ . }} different random tools"
            flag="-sto"
            label="Starting Tools"
          />
        </div>

        {/* Right Column: Starting Items & Starting Junk */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
              <FlagLabel
                flag={"-si"}
                helperText={"The dropdown menus support searching for items"}
                label={"Starting Items"}
              />
              <StartingItemsAddItemButton items={items} />
            </div>

            <div className="max-h-[380px] overflow-y-auto overflow-x-hidden pr-2 flex flex-col gap-2">
              {items.items.map((i: StartingItem, idx: number) => (
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

          <div className="pt-6 border-t border-zinc-800">
            <FlagSlider
              flag="-sj"
              label="Starting Junk"
              helperText="Begin the game with {{.}} unique low tier items (weapons, armors, helmets, shields, and relics)"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
