import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  token: null,
  isLoggedIn: false,
  status: "",
  message: null,
  updateStatus: "",
  isLoading: false,
};

export const authSlice = createSlice({
  initialState,
  name: "authSlice",
  reducers: {
    autoAuthenticationSuccess(state, { payload }) {
      state.user = payload.user;
      state.token = payload.token;
      state.isLoggedIn = !!state.token;
      state.isLoading = false;
    },
    setAuthenticationLoading(state, { payload }) {
      state.isLoading = payload;
    },
    authenticationSuccess(state, { payload }) {
      console.log("payload", payload);
      state.user = payload.user;
      state.token = payload.token;
      state.isLoggedIn = !!state.token;
      state.isLoading = false;
    },
    updateProfileSuccess(state, { payload }) {
      state.user = payload;
      state.isLoading = false;
    },

    logout(state) {
      state.user = {};
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem("AuthToken");
      localStorage.removeItem("CurrentUser");
    },
  },
});
const { reducer, actions } = authSlice;

export const {
  autoAuthenticationSuccess,
  authenticationSuccess,
  updateProfileSuccess,
  logout,
  setAuthenticationLoading,
} = actions;

export default reducer;
