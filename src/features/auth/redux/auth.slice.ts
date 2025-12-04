import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAuthState } from './auth.state';
import type { User } from '@/types/common';

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginRequested: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSucceeded: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerRequested: (state, _action: PayloadAction<{ email: string; password: string; name: string }>) => {
      state.loading = true;
      state.error = null;
    },
    registerSucceeded: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    registerFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutRequested: (state) => {
      state.loading = true;
    },
    logoutSucceeded: (state) => {
      state.user = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
    meRequested: (state) => {
      state.loading = true;
    },
    meSucceeded: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    meFailed: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const {
  loginRequested,
  loginSucceeded,
  loginFailed,
  registerRequested,
  registerSucceeded,
  registerFailed,
  logoutRequested,
  logoutSucceeded,
  meRequested,
  meSucceeded,
  meFailed,
} = authSlice.actions;

export default authSlice.reducer;
