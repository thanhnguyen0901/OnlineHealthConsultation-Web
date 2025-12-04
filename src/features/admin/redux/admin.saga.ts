import { call, put, takeLatest } from 'redux-saga/effects';
import {
  loadStatsRequested,
  loadStatsSucceeded,
  loadStatsFailed,
  loadUsersRequested,
  loadUsersSucceeded,
  loadUsersFailed,
  loadDoctorsRequested,
  loadDoctorsSucceeded,
  loadDoctorsFailed,
  loadSpecialtiesRequested,
  loadSpecialtiesSucceeded,
  loadSpecialtiesFailed,
} from './admin.slice';
import * as adminApi from '../apis/admin.api';
import type { User } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

function* handleLoadStats() {
  try {
    const stats: AdminStats = yield call(adminApi.getStats);
    yield put(loadStatsSucceeded(stats));
  } catch (error) {
    yield put(loadStatsFailed((error as Error).message));
  }
}

function* handleLoadUsers() {
  try {
    const users: User[] = yield call(adminApi.getUsers);
    yield put(loadUsersSucceeded(users));
  } catch (error) {
    yield put(loadUsersFailed((error as Error).message));
  }
}

function* handleLoadDoctors() {
  try {
    const doctors: Doctor[] = yield call(adminApi.getDoctors);
    yield put(loadDoctorsSucceeded(doctors));
  } catch (error) {
    yield put(loadDoctorsFailed((error as Error).message));
  }
}

function* handleLoadSpecialties() {
  try {
    const specialties: Specialty[] = yield call(adminApi.getSpecialties);
    yield put(loadSpecialtiesSucceeded(specialties));
  } catch (error) {
    yield put(loadSpecialtiesFailed((error as Error).message));
  }
}

export function* adminSaga() {
  yield takeLatest(loadStatsRequested.type, handleLoadStats);
  yield takeLatest(loadUsersRequested.type, handleLoadUsers);
  yield takeLatest(loadDoctorsRequested.type, handleLoadDoctors);
  yield takeLatest(loadSpecialtiesRequested.type, handleLoadSpecialties);
}
