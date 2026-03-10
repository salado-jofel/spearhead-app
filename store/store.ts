import facilitiesSlice from "@/app/dashboard/facilities/(redux)/facilities-slice";
import facilitySlice from "@/app/dashboard/facilities/[id]/(redux)/facility-slice";
import ordersSlice from "@/app/dashboard/orders/(redux)/orders-slice";
import productsSlice from "@/app/dashboard/products/(redux)/products-slice";
import profileSlice from "@/app/dashboard/profile/(redux)/profile-slice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    facilities: facilitiesSlice,
    facility: facilitySlice,
    products: productsSlice,
    orders: ordersSlice,
    profile: profileSlice,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
