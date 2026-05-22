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

  const validItems = items.items.filter(i => i.id >= 0 && i.name);

  return (
    <Card title={"Starting Gold/Items"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left Column: Starting Items */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex flex-col gap-1">
            <FlagLabel
              flag={"-si"}
              helperText={"The dropdown menus support searching for items"}
              label={"Starting Items"}
            />
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
            <StartingItemsAddItemButton items={items} />
          </div>
        </div>

        {/* Right Column: Sliders and numeric options + Summary at the bottom */}
        <div className="flex flex-col h-full justify-between gap-6">
          <div className="flex flex-col gap-4">
            <FlagNumberInput
              description="Begin the game with {{ . }} gold"
              flag="-gp"
              label="Starting Gold"
              type="int"
            />

            <FlagSlider
              helperText="Begin the game with {{ . }} different random tools"
              flag="-sto"
              label="Starting Tools"
            />

            <FlagSlider
              flag="-sj"
              label="Starting Junk"
              helperText="Begin the game with {{.}} unique low tier items (weapons, armors, helmets, shields, and relics)"
            />
          </div>

          {/* Starting Items Summary Panel */}
          <div className="flex flex-col gap-2 pt-6 border-t border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Starting Items Summary
            </span>
            {validItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {validItems.map((item, idx) => {
                  const qty = item.min === item.max ? `${item.min}` : `${item.min}-${item.max}`;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 dark:bg-[#181d29] text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-[#38445e]/50 rounded-md text-xs font-medium shadow-sm transition-all hover:bg-blue-100/50 dark:hover:bg-[#1f2637]"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        x{qty}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs italic text-zinc-500">No starting items selected.</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
