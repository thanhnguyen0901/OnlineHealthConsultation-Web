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
import { saveAuthToStorage, loadAuthFromStorage, clearAuthStorage } from '@/utils/authStorage';
import i18n from '@/i18n/initI18n';

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: AuthResult = yield call(authApi.login, action.payload);
    yield put(loginSucceeded(result));
    // Persist so the next page load can hydrate from sessionStorage instead of POST /auth/refresh.
    saveAuthToStorage(result.accessToken);
  } catch (error) {
    const msg = extractErrorMessage(error, i18n.t('auth:loginInvalidCredentials'));
    yield put(loginFailed(msg));
    yield put(
      addToast({ severity: 'error', summary: i18n.t('auth:loginFailedTitle'), detail: msg })
    );
  }
}

function* handleRegister(
  action: PayloadAction<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'PATIENT' | 'DOCTOR';
    specialtyId?: string;
  }>
) {
  try {
    const result: AuthResult = yield call(authApi.register, action.payload);
    yield put(registerSucceeded(result));
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('auth:welcomeTitle'),
        detail:
          action.payload.role === 'DOCTOR'
            ? i18n.t('auth:registerDoctorPendingApproval')
            : i18n.t('auth:registerCreated'),
      })
    );
    // registerSucceeded does not set isAuthenticated; user must log in explicitly.
  } catch (error) {
    const msg = extractErrorMessage(error, i18n.t('auth:registerFailedFallback'));
    yield put(registerFailed(msg));
    yield put(
      addToast({ severity: 'error', summary: i18n.t('auth:registerFailedTitle'), detail: msg })
    );
  }
}

function* handleLogout() {
  try {
    yield call(authApi.logout);
  } catch (error) {
    // Logout API errors are non-fatal; always clear local auth state.
  } finally {
    // Reset single-flight refresh lock to prevent stale Promise reuse after re-login.
    resetRefreshState();
    clearAuthStorage();
    yield put(logoutSucceeded());
  }
}

function* handleMe() {
  // Use cached sessionStorage token first to avoid POST /auth/refresh on every page load.
  const stored = loadAuthFromStorage();

  if (stored) {
    if (import.meta.env.DEV) {
      console.debug(
        `[auth:init] using-sessionStorage-token` +
          ` | expiresAtMs=${stored.expiresAtMs}` +
          ` | remainingMs=${stored.expiresAtMs - Date.now()}`
      );
    }
    try {
      const result: AuthResult = yield call(authApi.meWithToken, stored.accessToken);
      yield put(meSucceeded(result));
      return;
    } catch {
      // Server rejected stored token (e.g. secret rotation or revocation); fall through to refresh.
      clearAuthStorage();
      if (import.meta.env.DEV) {
        console.debug('[auth:init] sessionStorage token rejected — falling back to refresh');
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.debug('[auth:init] no valid sessionStorage token — calling refresh');
    }
  }

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
