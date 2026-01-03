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

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: AuthResult = yield call(authApi.login, action.payload);
    yield put(loginSucceeded(result));
  } catch (error) {
    yield put(loginFailed((error as Error).message));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; name: string }>) {
  try {
    const result: AuthResult = yield call(authApi.register, action.payload);
    yield put(registerSucceeded(result));
  } catch (error) {
    yield put(registerFailed((error as Error).message));
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
