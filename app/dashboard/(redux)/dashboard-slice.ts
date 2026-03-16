import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UserRole = "sales_representative" | "doctor" | null;

interface UserState {
  name: string;
  email: string;
  initials: string;
  role: UserRole;
}

const initialState: UserState = {
  name: "",
  email: "",
  initials: "",
  role: null,
};

const dashboardSlice = createSlice({
  name: "Dashboard",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.initials = action.payload.initials;
      state.role = action.payload.role;
    },
  },
});

export const { setUser } = dashboardSlice.actions;
export default dashboardSlice.reducer;
