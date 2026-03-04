import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './auth.slice';
import * as authApi from '../apis/auth.api';
import type { AuthResult } from '../apis/auth.api';
import { resetRefreshState } from '@/apis/core/refreshManager';
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';
import {
  saveAuthToStorage,
  loadAuthFromStorage,
  clearAuthStorage,
} from '@/utils/authStorage';

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: AuthResult = yield call(authApi.login, action.payload);
    yield put(loginSucceeded(result));
    // Persist so the next reload can hydrate Redux from sessionStorage instead
    // of always issuing POST /api/auth/refresh.
    saveAuthToStorage(result.accessToken);
  } catch (error) {
    const msg = extractErrorMessage(error, 'Invalid email or password');
    yield put(loginFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Login Failed', detail: msg }));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; firstName: string; lastName: string; role: 'PATIENT' | 'DOCTOR' }>) {
  try {
    const result: AuthResult = yield call(authApi.register, action.payload);
    yield put(registerSucceeded(result));
    yield put(addToast({ severity: 'success', summary: 'Welcome!', detail: 'Account created successfully' }));
    // Note: registerSucceeded intentionally does NOT set isAuthenticated.
    // The user must log in explicitly, so we do NOT save to sessionStorage here.
  } catch (error) {
    const msg = extractErrorMessage(error, 'Registration failed. Please try again.');
    yield put(registerFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Registration Failed', detail: msg }));
  }
}

function* handleLogout() {
  try {
    yield call(authApi.logout);
  } catch (error) {
    // Ignore logout API errors — always clear local auth state regardless.
  } finally {
    // Reset the single-flight refresh lock so any stale in-flight promise
    // from before logout cannot be accidentally reused after re-login.
    resetRefreshState();
    // Clear persisted token so the next bootstrap does not try to reuse it.
    clearAuthStorage();
    yield put(logoutSucceeded());
  }
}

function* handleMe() {
  // ── Hướng B: try sessionStorage first ─────────────────────────────────────
  // If we have a non-expired access token from a previous tab session, call
  // GET /auth/me with it directly — no POST /api/auth/refresh needed.
  const stored = loadAuthFromStorage();

  if (stored) {
    if (import.meta.env.DEV) {
      console.debug(
        `[auth:init] init:using-sessionStorage-token` +
        ` | expiresAtMs=${stored.expiresAtMs}` +
        ` | remainingMs=${stored.expiresAtMs - Date.now()}`
      );
    }
    try {
      const result: AuthResult = yield call(authApi.meWithToken, stored.accessToken);
      yield put(meSucceeded(result));
      return; // done — no refresh needed
    } catch {
      // Server rejected the stored token (e.g. secret rotation, revocation).
      // Clear storage and fall through to the normal refresh flow.
      clearAuthStorage();
      if (import.meta.env.DEV) {
        console.debug('[auth:init] sessionStorage token rejected by /auth/me — falling back to refresh');
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.debug('[auth:init] init:calling-refresh — no valid sessionStorage token');
    }
  }

  // ── Fallback: normal silent refresh via httpOnly cookie ───────────────────
  try {
    const result: AuthResult = yield call(authApi.refresh);
    yield put(meSucceeded(result));
  } catch (error) {
    yield put(meFailed());
  }
}

export function* authSaga() {
  yield takeLatest(loginRequested.type, handleLogin);
  yield takeLatest(registerRequested.type, handleRegister);
  yield takeLatest(logoutRequested.type, handleLogout);
  yield takeLatest(meRequested.type, handleMe);
}
