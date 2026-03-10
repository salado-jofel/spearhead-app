import facilitiesSlice from "@/app/dashboard/facilities/(redux)/facilities-slice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    facilities: facilitiesSlice,
  },
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
