import type {
  Facility,
  UpdateFacilityPayload,
} from "@/app/(interfaces)/facility";
import type { Product } from "@/app/(interfaces)/product";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./facility-state";

const facilitySlice = createSlice({
  name: "facility",
  initialState,
  reducers: {
    // ── Facility ────────────────────────────────────────────────────────
    setFacility(state, action: PayloadAction<Facility>) {
      state.item = action.payload;
    },
    updateFacilityInStore(state, action: PayloadAction<UpdateFacilityPayload>) {
      if (state.item) {
        state.item = { ...state.item, ...action.payload };
      }
    },
    clearFacility(state) {
      state.item = null;
      state.products = [];
    },

    // ── Products ────────────────────────────────────────────────────────
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    addProductToStore(state, action: PayloadAction<Product>) {
      state.products.unshift(action.payload);
    },
    updateProductInStore(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProductFromStore(state, action: PayloadAction<string>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  setFacility,
  updateFacilityInStore,
  clearFacility,
  setProducts,
  addProductToStore,
  updateProductInStore,
  removeProductFromStore,
} = facilitySlice.actions;

export default facilitySlice.reducer;
