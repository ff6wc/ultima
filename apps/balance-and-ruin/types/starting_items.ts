export type StartingItemsMetadata = {
  itemsMetadata: RawStartingItem[];
};

export type RawStartingItem = {
  id: number;
  name: string;
  hideable: boolean;
}

export type StartingItem = {
  name: string;
  id: number;
  /**  
  range: boolean; always is a range*/
  min: number;
  max: number;
};

export type StartingItems = {
  items: StartingItem[];
  // value: string;
};
