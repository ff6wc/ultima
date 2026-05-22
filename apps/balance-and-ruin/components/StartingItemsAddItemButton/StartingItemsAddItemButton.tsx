import { Button } from "@ff6wc/ui";
import { useDispatch } from "react-redux";
import { setFlag } from "~/state/flagSlice";
import {
  MAX_CUSTOM_ITEM_COUNT,
  setItems,
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

  const addItem = () => {
    if (items.items.length >= MAX_CUSTOM_ITEM_COUNT) {
      return;
    }
    const newItems = { ...items };
    const itemsArray = [...items.items];
    const newItem: StartingItem = {
      id: -1,
      name: "",
      min: 1,
      max: 1,
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
