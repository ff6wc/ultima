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
import { MdClear } from "react-icons/md";

type StartingItemsProps = {
  items: StartingItems;
  item: StartingItem;
};


export const StartingItemsRemoveItemButton = ({
  items, item
}: StartingItemsProps) => {
  const dispatch = useDispatch();

  const isCleared = item.id === -1;

  const removeItem = () => {
    if (items.items.length <= 0) {
      return;
    }
    const newItems = { ...items };
    const itemsArray = [...items.items];
    const index = itemsArray.indexOf(item);
    if (index > -1) {
      if (isCleared) {
        // If it's already cleared, delete the slot/row completely from the list
        itemsArray.splice(index, 1);
      } else {
        // Otherwise, reset the item ID and name to clear the selection, retaining the dropdown
        itemsArray[index] = {
          ...item,
          id: -1,
          name: "",
          min: 1,
          max: 1,
        };
      }
    }
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
      className="w-fit flex-shrink-0"
      disabled={items.items.length <= 0}
      onClick={removeItem}
      size="small"
      variant={isCleared ? "danger" : "secondary"}
    >
      {isCleared ? "Remove Slot" : "Clear Item"}
    </Button>
  );
};
