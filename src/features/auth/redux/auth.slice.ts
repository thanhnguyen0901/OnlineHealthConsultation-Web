import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAuthState } from './auth.state';
import type { User } from '@/types/common';

interface AuthSuccessPayload {
  user: User;
  accessToken: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginRequested: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSucceeded: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerRequested: (
      state,
      _action: PayloadAction<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'PATIENT' | 'DOCTOR';
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.registerCompleted = false;
    },
    registerSucceeded: (state, _action: PayloadAction<AuthSuccessPayload>) => {
      // Not setting isAuthenticated prevents HomeRedirect from skipping /login after registration.
      state.loading = false;
      state.registerCompleted = true;
      state.error = null;
    },
    registerFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.registerCompleted = false;
    },
    clearRegisterCompleted: (state) => {
      state.registerCompleted = false;
    },
    logoutRequested: (state) => {
      state.loading = true;
    },
    logoutSucceeded: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
    meRequested: (state) => {
      state.loading = true;
    },
    meSucceeded: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isBootstrapping = false;
    },
    meFailed: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.isBootstrapping = false;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
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
  clearRegisterCompleted,
  logoutRequested,
  logoutSucceeded,
  meRequested,
  meSucceeded,
  meFailed,
  setAccessToken,
} = authSlice.actions;

export default authSlice.reducer;
