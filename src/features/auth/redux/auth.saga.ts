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
import type { User } from '@/types/common';
import { storage } from '@/utils/storage';

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const user: User = yield call(authApi.login, action.payload);
    yield put(loginSucceeded(user));
  } catch (error) {
    yield put(loginFailed((error as Error).message));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; name: string }>) {
  try {
    const user: User = yield call(authApi.register, action.payload);
    yield put(registerSucceeded(user));
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
    // Always clear access token from localStorage
    storage.remove('accessToken');
    yield put(logoutSucceeded());
  }
}

function* handleMe() {
  try {
    const user: User = yield call(authApi.me);
    yield put(meSucceeded(user));
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
