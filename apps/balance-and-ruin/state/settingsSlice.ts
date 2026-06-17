import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";

type SettingValue = string | number | string[] | number[] | boolean | null;

// Type for our state
export interface SettingsState {
  settings: {
    /** Show flags that are - only turn on once they are defaulted properly in WorldsCollide */
    showDeprecated: boolean;
    /** TODO: Workshop */
    showWorkshop: boolean;
    /** Hides header, hero image, footer from the view */
    showLayout: boolean;
    /** Displays the flag name next to the option title */
    showFlags: boolean;
  };
  version: string;
}

// Initial state
const initialState: SettingsState = {
  settings: {
    showDeprecated: true,
    showWorkshop: false,
    showLayout: false,
    showFlags: false,
  },
  version: "1.4.4d",
};

// Actual Slice
export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Action to set the settingsentication status
    setSetting(state, action) {},
    setShowFlags(state, action: { payload: boolean }) {
      state.settings.showFlags = action.payload;
    },
    setVersion(state, action: { payload: string }) {
      if (action.payload) {
        state.version = action.payload;
      }
    },
  },
  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.settings,
      };
    },
  },
});

export const { setSetting, setShowFlags, setVersion } = settingsSlice.actions;

export const selectSettings = (state: AppState) => state?.settings?.settings;
export const selectShowFlags = (state: AppState) =>
  !!state?.settings?.settings?.showFlags;
export const selectVersion = (state: AppState) => state?.settings?.version;

export default settingsSlice.reducer;
