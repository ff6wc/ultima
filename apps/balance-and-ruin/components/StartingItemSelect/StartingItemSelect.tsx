import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, SelectOption } from "~/components/Select/Select";
import { selectItemById } from "~/state/itemSlice";
import { StartingItem, StartingItems } from "~/types/starting_items";
import { Slider, Input } from "@ff6wc/ui";
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

  const onMinInputChange = (val: number) => {
    const parsed = Math.max(1, Math.min(99, val || 1));
    const maxVal = Math.max(parsed, item.max);
    onRangeValueChange([parsed, maxVal]);
  };

  const onMaxInputChange = (val: number) => {
    const parsed = Math.max(1, Math.min(99, val || 1));
    const minVal = Math.min(parsed, item.min);
    onRangeValueChange([minVal, parsed]);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-blue-50/50 dark:bg-[#181d29] rounded-lg border border-blue-100 dark:border-[#38445e]/50 hover:border-blue-200 dark:hover:border-[#38445e]/80 transition-all shadow-md w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <div className="flex-grow min-w-0">
          <Select
            options={selectOptions}
            onChange={(val) => onSelectValueChange(val)}
            value={getSelectedValueOption()}
            isSearchable={true}
            placeholder="Select starting item..."
          />
        </div>
        {item.id !== -1 && (
          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-sub)] sm:hidden font-medium">Quantity:</span>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                className="w-14 text-center px-1"
                min={1}
                max={99}
                value={item.min}
                onChange={(e) => onMinInputChange(Number.parseInt(e.target.value))}
              />
              <span className="text-xs text-[var(--text-sub)]">to</span>
              <Input
                type="number"
                className="w-14 text-center px-1"
                min={1}
                max={99}
                value={item.max}
                onChange={(e) => onMaxInputChange(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
        {item.id === -1 && (
          <div className="flex justify-end sm:justify-start shrink-0 w-full sm:w-auto">
            <StartingItemsRemoveItemButton items={items} item={item} />
          </div>
        )}
      </div>

      {item.id !== -1 && (
        <div className="flex items-center gap-4 px-2 pt-1 pb-1 w-full">
          <div className="flex-1">
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
          <StartingItemsRemoveItemButton items={items} item={item} />
        </div>
      )}
    </div>
  );
};
