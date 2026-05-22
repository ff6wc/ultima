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
      className="flex items-center justify-center w-full h-10 border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-500/50 bg-blue-50/10 dark:bg-blue-950/5 hover:bg-blue-50/35 dark:hover:bg-blue-950/20 transition-all duration-300 rounded-lg cursor-pointer group my-2 p-1"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 group-hover:scale-110 group-hover:border-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300">
        <FaPlus className="text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 text-[10px] transition-colors" />
      </div>
    </div>
  );
};

