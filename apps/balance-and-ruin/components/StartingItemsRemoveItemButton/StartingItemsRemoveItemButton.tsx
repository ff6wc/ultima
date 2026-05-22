import { useDispatch } from "react-redux";
import { setFlag } from "~/state/flagSlice";
import { setItems } from "~/state/itemSlice";
import { StartingItems, StartingItem } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";
import { FaTrash } from "react-icons/fa";

type StartingItemsProps = {
  items: StartingItems;
  item: StartingItem;
};

export const StartingItemsRemoveItemButton = ({
  items,
  item,
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
    <button
      disabled={items.items.length <= 0}
      onClick={removeItem}
      className={`p-2 rounded transition-all cursor-pointer flex items-center justify-center shrink-0 ${
        isCleared
          ? "text-red-400 hover:text-red-500 hover:bg-red-950/30"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
      }`}
      title={isCleared ? "Remove Slot" : "Clear Item"}
      style={{ width: "32px", height: "32px" }}
    >
      <FaTrash size={13} />
    </button>
  );
};

