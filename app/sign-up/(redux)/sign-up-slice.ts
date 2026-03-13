import { Profile } from "@/app/(interfaces)/profiles";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./sign-up-state";



const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile>) {
      state.item = action.payload;
    },
    updateProfileInStore(state, action: PayloadAction<Partial<Profile>>) {
      if (state.item) {
        state.item = { ...state.item, ...action.payload };
      }
    },
  },
});

export const { setProfile, updateProfileInStore } = profileSlice.actions;
export default profileSlice.reducer;
