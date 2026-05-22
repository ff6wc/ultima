import { Card } from "@ff6wc/ui";
import { useDispatch } from "react-redux";
import { CardColumn } from "~/components/CardColumn/CardColumn";
import { FlagLabel } from "~/components/FlagLabel/FlagLabel";
import { FlagNumberInput } from "~/components/FlagNumberInput/FlagNumberInput";
import { FlagSlider } from "~/components/FlagSlider/FlagSlider";
import { FlagTextInput } from "~/components/FlagInput/FlagInput";

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
        <div className="hidden md:block" />

        <FlagSlider
          flag="-sshoes"
          helperText="Begin the game with {{ . }} Sprint Shoes"
          label="Starting Sprint Shoes"
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
          flag="-sj"
          label="Starting Junk"
          helperText="Begin the game with {{.}} unique low tier items (weapons, armors, helmets, shields, and relics)"
        />
        <FlagSlider
          helperText="Begin the game with {{ . }} different random tools"
          flag="-sto"
          label="Starting Tools"
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
