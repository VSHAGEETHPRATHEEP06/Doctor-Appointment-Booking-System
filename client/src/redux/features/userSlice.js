import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    lastFetchTimestamp: 0,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.lastFetchTimestamp = Date.now();
    },
    clearUser: (state) => {
      state.user = null;
      state.lastFetchTimestamp = 0;
    },
    updateLastFetchTimestamp: (state) => {
      state.lastFetchTimestamp = Date.now();
    },
  },
});

export const { setUser, clearUser, updateLastFetchTimestamp } = userSlice.actions;