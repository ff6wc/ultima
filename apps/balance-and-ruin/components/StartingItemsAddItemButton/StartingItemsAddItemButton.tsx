import { useDispatch } from "react-redux";
import { setFlag } from "~/state/flagSlice";
import {
  MAX_CUSTOM_ITEM_COUNT,
  setItems,
} from "~/state/itemSlice";
import { StartingItems, StartingItem } from "~/types/starting_items";
import { startingItemsToString } from "~/utils/startingItemsToString";
import { FaPlus } from "react-icons/fa";

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

  if (items.items.length >= MAX_CUSTOM_ITEM_COUNT) {
    return null;
  }

  return (
    <div
      onClick={addItem}
      title="Add Starting Item"
      className="flex items-center justify-center w-full h-10 border-2 border-dashed border-zinc-700/60 hover:border-blue-400 dark:hover:border-blue-500/50 bg-zinc-800/10 hover:bg-zinc-800/30 transition-all duration-300 rounded-lg cursor-pointer group my-2 p-1"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-600 bg-zinc-800 group-hover:scale-110 group-hover:border-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300">
        <FaPlus className="text-zinc-400 group-hover:text-blue-500 text-[10px] transition-colors" />
      </div>
    </div>
  );
};

