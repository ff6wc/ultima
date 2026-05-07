import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { AppState } from "./store";
import { RawStartingItem, StartingItemsMetadata, StartingItem, StartingItems } from "~/types/starting_items";
import { startingItemsToData } from "~/utils/flagsToData";
import itemsMetadata from "./items.json";

// Type for our state
export interface StartingItemsState {
    metadata: StartingItemsMetadata;

    metadataById: {
        items: Record<number, RawStartingItem>;
    };
    /** ordered objective array */
    items: StartingItems;
}

// Initial state
const initialState: StartingItemsState = {
    metadata: {
        itemsMetadata: [],
    },
    metadataById: {
        items: {},
    },
    items: {
        items:[
            {
                id: 222,
                name: "Moogle Charm",
                min: 3,
                max: 3
            }
        ],
    },
};

export const MAX_CUSTOM_ITEM_COUNT = 30;

export const upsertItem = (items: StartingItems, item: StartingItem) => {
    let foundItem = items.items.find(i => i.id == item.id)

    if (foundItem == undefined) {
        items.items = items.items.concat(item)
    }
    else {
        foundItem.min = item.min
        foundItem.max = item.max
    }

    return items
}

// Actual Slice
export const itemSlice = createSlice({
    name: "item",
    initialState,
    reducers: {
        initItemMetadata(state) {
            state.metadata = itemsMetadata;
            const items = itemsMetadata.itemsMetadata.reduce( (acc, val) => {
                acc[val.id] = val;
                return acc;
            }, {} as Record<string, RawStartingItem>);
            state.metadataById = {
                items: items,
            };
        },
        setItems(state, action: PayloadAction<StartingItems>) {
            state.items = action.payload;
        },
        setRawStartingItems(state, action: PayloadAction<string>) {
            const startingItems = startingItemsToData(action.payload);
            const items = Object.entries(startingItems).map(
                ([flag, value]) => {
                    let tempItemsArray: StartingItem[] = []
                    let tempItems: StartingItems = {
                        items: tempItemsArray
                    }
                    const values = value.split(".");
                    let nextConditionIdx = 0;
                    values.forEach((val, idx) => {
                        if (idx !== nextConditionIdx) {
                            return;
                        }

                        nextConditionIdx += 3;

                        const itemMetadata = state.metadataById.items[Number.parseInt(val)];
                        if (!itemMetadata) {
                            return;
                        }
                        const { id, name } =
                            itemMetadata;

                        tempItems.items.push({
                            id: id,
                            name: name,
                            min: Number.parseInt(values[idx + 1]),
                            max: Number.parseInt(values[idx + 2]),
                        });
                    });

                    return {
                        ...tempItems,
                    } as StartingItems;
                }
            );
            if (items && items.length > 0 && items[0]) {
                state.items.items = items[0].items;
            } else {
                state.items.items = []
            }
        },
    },
    // Special reducer for hydrating the state. Special case for next-redux-wrapper
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.items,
            };
        },
    },
});

export const {
    setItems,
    setRawStartingItems,
    initItemMetadata,
} = itemSlice.actions;

export const selectStartingItems = (state: AppState) =>
    state.item.items;

export const selectItemById = (state: AppState) =>{
    // this should be state.item.metadataById but for somereason
    // it is losing it's values between the create page starting up
    // and when the user clicks to add an item to the list
    return itemsMetadata.itemsMetadata.reduce( (acc, val) => {
        acc[val.id] = val;
        return acc;
    }, {} as Record<string, RawStartingItem>);;
}


export default itemSlice.reducer;
