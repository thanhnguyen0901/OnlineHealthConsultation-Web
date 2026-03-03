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
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';

function* handleLoadStats() {
  try {
    const stats: AdminStats = yield call(adminApi.getStats);
    yield put(loadStatsSucceeded(stats));
  } catch (error) {
    yield put(loadStatsFailed(extractErrorMessage(error)));
  }
}

function* handleLoadUsers() {
  try {
    const users: User[] = yield call(adminApi.getUsers);
    yield put(loadUsersSucceeded(users));
  } catch (error) {
    yield put(loadUsersFailed(extractErrorMessage(error)));
  }
}

function* handleLoadDoctors() {
  try {
    const doctors: Doctor[] = yield call(adminApi.getDoctors);
    yield put(loadDoctorsSucceeded(doctors));
  } catch (error) {
    yield put(loadDoctorsFailed(extractErrorMessage(error)));
  }
}

function* handleLoadSpecialties() {
  try {
    const specialties: Specialty[] = yield call(adminApi.getSpecialties);
    yield put(loadSpecialtiesSucceeded(specialties));
  } catch (error) {
    yield put(loadSpecialtiesFailed(extractErrorMessage(error)));
  }
}

// User CRUD Sagas
function* handleCreateUser(action: PayloadAction<Partial<User> & { password: string }>) {
  try {
    const user: User = yield call(adminApi.createUser, action.payload);
    yield put(createUserSucceeded(user));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'User created successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(createUserFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateUser(action: PayloadAction<{ id: string; data: Partial<User> }>) {
  try {
    const user: User = yield call(adminApi.updateUser, action.payload.id, action.payload.data);
    yield put(updateUserSucceeded(user));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'User updated successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateUserFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleDeleteUser(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteUser, action.payload);
    yield put(deleteUserSucceeded(action.payload));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(deleteUserFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

// Doctor CRUD Sagas
function* handleCreateDoctor(action: PayloadAction<Partial<Doctor> & { password: string }>) {
  try {
    const doctor: Doctor = yield call(adminApi.createDoctor, action.payload);
    yield put(createDoctorSucceeded(doctor));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Doctor created successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(createDoctorFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateDoctor(action: PayloadAction<{ id: string; data: Partial<Doctor> }>) {
  try {
    const doctor: Doctor = yield call(
      adminApi.updateDoctor,
      action.payload.id,
      action.payload.data
    );
    yield put(updateDoctorSucceeded(doctor));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Doctor updated successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateDoctorFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleDeleteDoctor(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteDoctor, action.payload);
    yield put(deleteDoctorSucceeded(action.payload));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Doctor deleted successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(deleteDoctorFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

// Specialty CRUD Sagas
function* handleCreateSpecialty(action: PayloadAction<Partial<Specialty>>) {
  try {
    const specialty: Specialty = yield call(adminApi.createSpecialty, action.payload);
    yield put(createSpecialtySucceeded(specialty));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Specialty created successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(createSpecialtyFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateSpecialty(action: PayloadAction<{ id: string; data: Partial<Specialty> }>) {
  try {
    const specialty: Specialty = yield call(
      adminApi.updateSpecialty,
      action.payload.id,
      action.payload.data
    );
    yield put(updateSpecialtySucceeded(specialty));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Specialty updated successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateSpecialtyFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleDeleteSpecialty(action: PayloadAction<string>) {
  try {
    yield call(adminApi.deleteSpecialty, action.payload);
    yield put(deleteSpecialtySucceeded(action.payload));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Specialty deleted successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(deleteSpecialtyFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

// Appointments Sagas
function* handleLoadAppointments(action: PayloadAction<{ status?: string; startDate?: string; endDate?: string } | undefined>) {
  try {
    const appointments: any[] = yield call(adminApi.getAppointments, action.payload);
    yield put(loadAppointmentsSucceeded(appointments));
  } catch (error) {
    yield put(loadAppointmentsFailed(extractErrorMessage(error)));
  }
}

function* handleUpdateAppointmentStatus(
  action: PayloadAction<{ id: string; status: string }>
): Generator<any, void, any> {
  try {
    const appointment: any = yield call(
      adminApi.updateAppointmentStatus,
      action.payload.id,
      action.payload.status
    );
    yield put(updateAppointmentStatusSucceeded(appointment));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Appointment status updated' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateAppointmentStatusFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

// Moderation Sagas
function* handleLoadModerationItems() {
  try {
    const items: any[] = yield call(adminApi.getModerationItems);
    yield put(loadModerationItemsSucceeded(items));
  } catch (error) {
    yield put(loadModerationItemsFailed(extractErrorMessage(error)));
  }
}

function* handleApproveModeration(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const item: any = yield call(adminApi.approveModeration, action.payload);
    yield put(approveModerationSucceeded(item));
    yield put(loadModerationItemsRequested());
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Item approved successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(approveModerationFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleRejectModeration(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const item: any = yield call(adminApi.rejectModeration, action.payload);
    yield put(rejectModerationSucceeded(item));
    yield put(loadModerationItemsRequested());
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Item rejected' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(rejectModerationFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
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
