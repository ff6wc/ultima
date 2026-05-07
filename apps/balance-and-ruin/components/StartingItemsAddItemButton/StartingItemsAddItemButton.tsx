import { Button } from "@ff6wc/ui";
import { useDispatch, useSelector } from "react-redux";
import { setFlag, useFlagValueSelector } from "~/state/flagSlice";
import {
  MAX_CUSTOM_ITEM_COUNT,
  setItems,
  selectItemById,
} from "~/state/itemSlice";
import { StartingItems, StartingItem } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";

type StartingItemsProps = {
  items: StartingItems;
};


export const StartingItemsAddItemButton = ({
  items,
}: StartingItemsProps) => {
  const dispatch = useDispatch();
  const itemsById = useSelector(selectItemById) ?? {};

  const addItem = () => {
    if (items.items.length >= MAX_CUSTOM_ITEM_COUNT) {
      return;
    }
    const MC_ID = 222
    const mcMeta = itemsById[MC_ID]
    const newItems = { ...items };
    const itemsArray = [...items.items];
    const newItem: StartingItem = {
      id: MC_ID,
      name: mcMeta.name,
      min: 3,
      max: 3,
    };

    itemsArray.push(newItem);
    newItems.items = itemsArray;

    dispatch(setItems(newItems));

    dispatch(
      setFlag({
        flag: "-si",
        value: startingItemsToString(newItems),
      })
    );
  };

  return (
    <Button
      className="w-fit"
      disabled={items.items.length >= MAX_CUSTOM_ITEM_COUNT}
      onClick={addItem}
      size="small"
      variant="primary"
    >
      Add Item
    </Button>
  );
};
