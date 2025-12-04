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

function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    // TEMPORARY: Mock login for testing - bypass API call
    const mockUser: User = {
      id: '1',
      email: action.payload.email,
      name: action.payload.email.split('@')[0],
      role: 'PATIENT', // Change to 'DOCTOR' or 'ADMIN' to test other roles
    };
    
    // Simulate API delay
    yield new Promise(resolve => setTimeout(resolve, 500));
    
    yield put(loginSucceeded(mockUser));
    
    // TODO: Uncomment when backend is ready
    // const user: User = yield call(authApi.login, action.payload);
    // yield put(loginSucceeded(user));
  } catch (error) {
    yield put(loginFailed((error as Error).message));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; name: string }>) {
  try {
    // TEMPORARY: Mock register for testing - bypass API call
    const mockUser: User = {
      id: '1',
      email: action.payload.email,
      name: action.payload.name,
      role: 'PATIENT',
    };
    
    // Simulate API delay
    yield new Promise(resolve => setTimeout(resolve, 500));
    
    yield put(registerSucceeded(mockUser));
    
    // TODO: Uncomment when backend is ready
    // const user: User = yield call(authApi.register, action.payload);
    // yield put(registerSucceeded(user));
  } catch (error) {
    yield put(registerFailed((error as Error).message));
  }
}

function* handleLogout() {
  try {
    // TEMPORARY: Mock logout - bypass API call
    // yield call(authApi.logout);
    yield put(logoutSucceeded());
  } catch (error) {
    yield put(logoutSucceeded()); // Logout anyway on error
  }
}

function* handleMe() {
  try {
    // TEMPORARY: Skip /me call for testing
    // const user: User = yield call(authApi.me);
    // yield put(meSucceeded(user));
    yield put(meFailed());
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
