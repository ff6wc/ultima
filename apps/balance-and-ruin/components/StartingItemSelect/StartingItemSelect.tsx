import { useMemo } from "react";
import { useSelector } from "react-redux";
import BaseSelect, { SingleValue } from "react-select";
import { SelectOption } from "~/components/Select/Select";
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
  const myMeta = meta[id];

  const options = useMemo(
    () =>
      Object.values(meta).map<SelectOption>((c) => ({
        label: c.name,
        value: c.id.toString(),
      })),
    [meta]
  );

  const optionsById = useMemo(
    () =>
      options.reduce((acc, val) => {
        acc[val.value] = val;
        return acc;
      }, {} as Record<string, SelectOption>),
    [options]
  );

  const selectedItem = optionsById[id];

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
    helperText = getHelperText();
  };

  const onSelectValueChange = (selected: SingleValue<SelectOption>) => {
    if (!selected) {
      return;
    }

    const idx = items.items.indexOf(item);

    if (!selected) {
      ("idk");
      return;
    }
    if (idx === -1) {
      // item doesn't exist in result?
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
    helperText = getHelperText();
    onChange(obj);
  };

  const selectOptions =
    Object.values(meta).filter(v => !v.hideable || !curateItems).map<SelectOption>((value, idx) => {
      return {
        label: value.name,
        value: value.id.toString(),
      };
    }) ?? [];

  const getSelectedValueOption = () =>
    selectOptions.find(
      ({ value }) => value === item.id?.toString()
    );

  const getHelperText = () =>
    {
      const min = item.min.toString();
      const max = item.max.toString();
      var name = item.name;
      if(!name.endsWith("s")) {
        name = name + "s";
      }
      return "Begin the game with " + min + "-" + max + " " + name + ".";
    }

  var helperText = getHelperText();

  return (
    <div className="flex flex-col gap-2">
      <HelperText> {helperText} </HelperText>
      <BaseSelect
        className="ff6wc-select-container"
        classNamePrefix="ff6wc-select"
        instanceId={id}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        options={selectOptions}
        onChange={(val) => onSelectValueChange(val)}
        value={getSelectedValueOption()}
        isSearchable={true}
      />

      <Slider
        markActiveValues
        min={1}
        max={99}
        step={1}
        onChange={(val) => onRangeValueChange(val)}
        range={true}
        value={[item.min,item.max]}
      />

      <StartingItemsRemoveItemButton items={items} item={item} />
      <br/>
    </div>
  );
};
