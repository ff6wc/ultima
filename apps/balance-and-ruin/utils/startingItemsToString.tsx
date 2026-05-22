import { StartingItems } from "~/types/starting_items";
import { isValidItem } from "~/utils/isValidItem";

export const startingItemsToString = (si: StartingItems) => {
  const { items } = si;

  const validItems = items.filter(i => isValidItem(i))
  const itemsString = validItems.length
    ? validItems
        .map((c) => {
          return `${c.id}.${c.min.toString()}.${c.max.toString()}`;
        })
        .join(".")
    : "";

  console.log("itemsString", itemsString);
  return itemsString;
};
