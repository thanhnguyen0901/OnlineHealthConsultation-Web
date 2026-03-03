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
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: AuthResult = yield call(authApi.login, action.payload);
    yield put(loginSucceeded(result));
  } catch (error) {
    const msg = extractErrorMessage(error, 'Invalid email or password');
    yield put(loginFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Login Failed', detail: msg }));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; firstName: string; lastName: string }>) {
  try {
    const result: AuthResult = yield call(authApi.register, action.payload);
    yield put(registerSucceeded(result));
    yield put(addToast({ severity: 'success', summary: 'Welcome!', detail: 'Account created successfully' }));
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
    // Ignore logout API errors - always clear local state
  } finally {
    yield put(logoutSucceeded());
  }
}

function* handleMe() {
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
