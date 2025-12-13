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
    // ===== HARD CODE FOR TESTING - COMMENT API CALL =====
    // const user: User = yield call(authApi.login, action.payload);
    
    // Uncomment role nào muốn test:
    
    // Option 1: Test PATIENT role
    const user: User = {
      id: '1',
      email: action.payload.email || 'patient@test.com', // Use input email if provided
      name: 'Test Patient',
      role: 'PATIENT',
    };
    
    // Option 2: Test DOCTOR role
    // const user: User = {
    //   id: '2',
    //   email: 'doctor@test.com',
    //   name: 'Dr. Test',
    //   role: 'DOCTOR',
    // };
    
    // Option 3: Test ADMIN role
    // const user: User = {
    //   id: '3',
    //   email: 'admin@test.com',
    //   name: 'Admin Test',
    //   role: 'ADMIN',
    // };
    // ===== END HARD CODE =====
    
    yield put(loginSucceeded(user));
  } catch (error) {
    yield put(loginFailed((error as Error).message));
  }
}

function* handleRegister(action: PayloadAction<{ email: string; password: string; name: string }>) {
  try {
    // ===== HARD CODE FOR TESTING - COMMENT API CALL =====
    // const user: User = yield call(authApi.register, action.payload);
    const user: User = {
      id: '1',
      email: action.payload.email,
      name: action.payload.name,
      role: 'PATIENT', // Default role khi register
    };
    // ===== END HARD CODE =====
    
    yield put(registerSucceeded(user));
  } catch (error) {
    yield put(registerFailed((error as Error).message));
  }
}

function* handleLogout() {
  try {
    // ===== HARD CODE FOR TESTING - COMMENT API CALL =====
    // yield call(authApi.logout);
    // ===== END HARD CODE =====
    yield put(logoutSucceeded());
  } catch (error) {
    yield put(logoutSucceeded()); // Logout anyway on error
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