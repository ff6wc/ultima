import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, SelectOption } from "~/components/Select/Select";
import { selectItemById } from "~/state/itemSlice";
import { StartingItem, StartingItems } from "~/types/starting_items";
import { Slider, HelperText } from "@ff6wc/ui";
import orderBy from "lodash/orderBy";
import { StartingItemsRemoveItemButton } from "~/components/StartingItemsRemoveItemButton/StartingItemsRemoveItemButton";

export type StartingItemSelectProps = {
  item: StartingItem;
  items: StartingItems;
  curateItems: boolean;
  onChange: (items: StartingItems) => any;
};

export const StartingItemSelect = ({
  item,
  items,
  curateItems,
  onChange,
}: StartingItemSelectProps) => {
  const { id, name } = item;

  const meta = orderBy(useSelector(selectItemById), i => i.name);

  const onRangeValueChange = (value: number[]) => {
    const idx = items.items.indexOf(item);
    const obj = { ...items };
    const array = [...items.items];
    const newItem: StartingItem = {
      ...item,
      min: value[0],
      max: value[1],
    };
    array[idx] = newItem;
    obj.items = array;
    onChange(obj);
  };

  const onSelectValueChange = (selected: SelectOption | null) => {
    if (!selected) {
      return;
    }

    const idx = items.items.indexOf(item);

    if (idx === -1) {
      console.error(
        "item not found within list of starting items",
        items,
        item
      );
      return;
    }

    const obj = { ...items };
    const array = [...items.items];
    const newItem: StartingItem = {
      ...item,
      id: Number.parseInt(selected.value),
      name: selected.label,
    };
    array[idx] = newItem;
    obj.items = array;
    onChange(obj);
  };

  const selectOptions = useMemo(() => {
    return Object.values(meta)
      .filter(v => !v.hideable || !curateItems)
      .map<SelectOption>((value) => ({
        label: value.name,
        value: value.id.toString(),
      })) ?? [];
  }, [meta, curateItems]);

  const getSelectedValueOption = () =>
    selectOptions.find(
      ({ value }) => value === item.id?.toString()
    ) || null;

  const getHelperText = () => {
    if (item.id === -1 || !item.name) {
      return "Select an item to begin.";
    }
    const min = item.min.toString();
    const max = item.max.toString();
    let displayName = item.name;
    if (!displayName.endsWith("s")) {
      displayName = displayName + "s";
    }
    return "Begin the game with " + min + "-" + max + " " + displayName + ".";
  };

  const helperText = getHelperText();

  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/60 transition-all shadow-md">
      <div className="flex justify-between items-center gap-4">
        <HelperText className="text-zinc-700 dark:text-zinc-300 font-medium"> {helperText} </HelperText>
        <StartingItemsRemoveItemButton items={items} item={item} />
      </div>

      <Select
        options={selectOptions}
        onChange={(val) => onSelectValueChange(val)}
        value={getSelectedValueOption()}
        isSearchable={true}
        placeholder="Select starting item..."
      />

      {item.id !== -1 && (
        <div className="px-2 pt-1 pb-1">
          <Slider
            markActiveValues
            min={1}
            max={99}
            step={1}
            onChange={(val) => onRangeValueChange(val)}
            range={true}
            value={[item.min, item.max]}
          />
        </div>
      )}
    </div>
  );
};
