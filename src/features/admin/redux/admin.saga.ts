import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
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
  createUserRequested,
  createUserSucceeded,
  createUserFailed,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  deleteUserRequested,
  deleteUserSucceeded,
  deleteUserFailed,
  createDoctorRequested,
  createDoctorSucceeded,
  createDoctorFailed,
  updateDoctorRequested,
  updateDoctorSucceeded,
  updateDoctorFailed,
  deleteDoctorRequested,
  deleteDoctorSucceeded,
  deleteDoctorFailed,
  createSpecialtyRequested,
  createSpecialtySucceeded,
  createSpecialtyFailed,
  updateSpecialtyRequested,
  updateSpecialtySucceeded,
  updateSpecialtyFailed,
  deleteSpecialtyRequested,
  deleteSpecialtySucceeded,
  deleteSpecialtyFailed,
  loadAppointmentsRequested,
  loadAppointmentsSucceeded,
  loadAppointmentsFailed,
  updateAppointmentStatusRequested,
  updateAppointmentStatusSucceeded,
  updateAppointmentStatusFailed,
  loadModerationItemsRequested,
  loadModerationItemsSucceeded,
  loadModerationItemsFailed,
  approveModerationRequested,
  approveModerationSucceeded,
  approveModerationFailed,
  rejectModerationRequested,
  rejectModerationSucceeded,
  rejectModerationFailed,
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

// User CRUD Sagas
function* handleCreateUser(action: PayloadAction<Partial<User> & { password: string }>) {
  try {
    const user: User = yield call(adminApi.createUser, action.payload);
    yield put(createUserSucceeded(user));
  } catch (error) {
    yield put(createUserFailed((error as Error).message));
  }
}

function* handleUpdateUser(action: PayloadAction<{ id: string; data: Partial<User> }>) {
  try {
    const user: User = yield call(adminApi.updateUser, action.payload.id, action.payload.data);
    yield put(updateUserSucceeded(user));
  } catch (error) {
    yield put(updateUserFailed((error as Error).message));
  }
}

function* handleDeleteUser(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteUser, action.payload);
    yield put(deleteUserSucceeded(action.payload));
  } catch (error) {
    yield put(deleteUserFailed((error as Error).message));
  }
}

// Doctor CRUD Sagas
function* handleCreateDoctor(action: PayloadAction<Partial<Doctor> & { password: string }>) {
  try {
    const doctor: Doctor = yield call(adminApi.createDoctor, action.payload);
    yield put(createDoctorSucceeded(doctor));
  } catch (error) {
    yield put(createDoctorFailed((error as Error).message));
  }
}

function* handleUpdateDoctor(action: PayloadAction<{ id: string; data: Partial<Doctor> }>) {
  try {
    const doctor: Doctor = yield call(adminApi.updateDoctor, action.payload.id, action.payload.data);
    yield put(updateDoctorSucceeded(doctor));
  } catch (error) {
    yield put(updateDoctorFailed((error as Error).message));
  }
}

function* handleDeleteDoctor(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteDoctor, action.payload);
    yield put(deleteDoctorSucceeded(action.payload));
  } catch (error) {
    yield put(deleteDoctorFailed((error as Error).message));
  }
}

// Specialty CRUD Sagas
function* handleCreateSpecialty(action: PayloadAction<Partial<Specialty>>) {
  try {
    const specialty: Specialty = yield call(adminApi.createSpecialty, action.payload);
    yield put(createSpecialtySucceeded(specialty));
  } catch (error) {
    yield put(createSpecialtyFailed((error as Error).message));
  }
}

function* handleUpdateSpecialty(action: PayloadAction<{ id: string; data: Partial<Specialty> }>) {
  try {
    const specialty: Specialty = yield call(adminApi.updateSpecialty, action.payload.id, action.payload.data);
    yield put(updateSpecialtySucceeded(specialty));
  } catch (error) {
    yield put(updateSpecialtyFailed((error as Error).message));
  }
}

function* handleDeleteSpecialty(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteSpecialty, action.payload);
    yield put(deleteSpecialtySucceeded(action.payload));
  } catch (error) {
    yield put(deleteSpecialtyFailed((error as Error).message));
  }
}

// Appointments Sagas
function* handleLoadAppointments() {
  try {
    const appointments: any[] = yield call(adminApi.getAppointments);
    yield put(loadAppointmentsSucceeded(appointments));
  } catch (error) {
    yield put(loadAppointmentsFailed((error as Error).message));
  }
}

function* handleUpdateAppointmentStatus(action: PayloadAction<{ id: string; status: string }>): Generator<any, void, any> {
  try {
    const appointment: any = yield call(adminApi.updateAppointmentStatus, action.payload.id, action.payload.status);
    yield put(updateAppointmentStatusSucceeded(appointment));
  } catch (error) {
    yield put(updateAppointmentStatusFailed((error as Error).message));
  }
}

// Moderation Sagas
function* handleLoadModerationItems() {
  try {
    const items: any[] = yield call(adminApi.getModerationItems);
    yield put(loadModerationItemsSucceeded(items));
  } catch (error) {
    yield put(loadModerationItemsFailed((error as Error).message));
  }
}

function* handleApproveModeration(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const item: any = yield call(adminApi.approveModeration, action.payload);
    yield put(approveModerationSucceeded(item));
    yield put(loadModerationItemsRequested());
  } catch (error) {
    yield put(approveModerationFailed((error as Error).message));
  }
}

function* handleRejectModeration(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const item: any = yield call(adminApi.rejectModeration, action.payload);
    yield put(rejectModerationSucceeded(item));
    yield put(loadModerationItemsRequested());
  } catch (error) {
    yield put(rejectModerationFailed((error as Error).message));
  }
}

export function* adminSaga() {
  yield takeLatest(loadStatsRequested.type, handleLoadStats);
  yield takeLatest(loadUsersRequested.type, handleLoadUsers);
  yield takeLatest(loadDoctorsRequested.type, handleLoadDoctors);
  yield takeLatest(loadSpecialtiesRequested.type, handleLoadSpecialties);
  yield takeLatest(createUserRequested.type, handleCreateUser);
  yield takeLatest(updateUserRequested.type, handleUpdateUser);
  yield takeLatest(deleteUserRequested.type, handleDeleteUser);
  yield takeLatest(createDoctorRequested.type, handleCreateDoctor);
  yield takeLatest(updateDoctorRequested.type, handleUpdateDoctor);
  yield takeLatest(deleteDoctorRequested.type, handleDeleteDoctor);
  yield takeLatest(createSpecialtyRequested.type, handleCreateSpecialty);
  yield takeLatest(updateSpecialtyRequested.type, handleUpdateSpecialty);
  yield takeLatest(deleteSpecialtyRequested.type, handleDeleteSpecialty);
  yield takeLatest(loadAppointmentsRequested.type, handleLoadAppointments);
  yield takeLatest(updateAppointmentStatusRequested.type, handleUpdateAppointmentStatus);
  yield takeLatest(loadModerationItemsRequested.type, handleLoadModerationItems);
  yield takeLatest(approveModerationRequested.type, handleApproveModeration);
  yield takeLatest(rejectModerationRequested.type, handleRejectModeration);
}
