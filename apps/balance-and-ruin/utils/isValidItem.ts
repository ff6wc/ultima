import { StartingItem } from "~/types/starting_items";

export const isValidItem = (i: StartingItem) => {
  return i.id >= 0 && i.id < 255;
};
