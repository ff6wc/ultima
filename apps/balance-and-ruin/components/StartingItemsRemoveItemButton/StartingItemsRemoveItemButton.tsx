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
  const removeItem = () => {
    if (items.items.length <= 0) {
      return;
    }
    const newItems = { ...items };
    const itemsArray = [...items.items];
    const index = itemsArray.indexOf(item);
    if (index > -1) {
      itemsArray.splice(index, 1);
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
      className="p-2 rounded transition-all cursor-pointer flex items-center justify-center shrink-0 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300 hover:bg-blue-100/60 dark:hover:bg-blue-950/30"
      title="Remove Item"
      style={{ width: "32px", height: "32px" }}
    >
      <FaTrash size={13} />
    </button>
  );
};

