import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  askQuestionRequested,
  askQuestionSucceeded,
  askQuestionFailed,
  bookAppointmentRequested,
  bookAppointmentSucceeded,
  bookAppointmentFailed,
  cancelAppointmentRequested,
  cancelAppointmentSucceeded,
  cancelAppointmentFailed,
  loadHistoryRequested,
  loadHistorySucceeded,
  loadHistoryFailed,
  loadProfileRequested,
  loadProfileSucceeded,
  loadProfileFailed,
  updateProfileRequested,
  updateProfileSucceeded,
  updateProfileFailed,
  rateConsultationRequested,
  rateConsultationSucceeded,
  rateConsultationFailed,
  loadSpecialtiesRequested,
  loadSpecialtiesSucceeded,
  loadSpecialtiesFailed,
  loadDoctorsBySpecialtyRequested,
  loadDoctorsBySpecialtySucceeded,
  loadDoctorsBySpecialtyFailed,
} from './patient.slice';
import * as patientApi from '../apis/patient.api';
import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';

function* handleAskQuestion(action: PayloadAction<{ question: string; specialtyId?: string }>) {
  try {
    const question: Question = yield call(patientApi.askQuestion, action.payload);
    yield put(askQuestionSucceeded(question));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Question submitted successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(askQuestionFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleBookAppointment(
  action: PayloadAction<{ doctorId: string; date: string; time: string; reason: string; notes?: string }>
) {
  try {
    const appointment: Appointment = yield call(patientApi.bookAppointment, action.payload);
    yield put(bookAppointmentSucceeded(appointment));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Appointment booked successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(bookAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadHistory() {
  try {
    const history: { questions: Question[]; appointments: Appointment[] } = yield call(
      patientApi.getHistory
    );
    yield put(loadHistorySucceeded(history));
  } catch (error) {
    yield put(loadHistoryFailed(extractErrorMessage(error)));
  }
}

function* handleLoadProfile() {
  try {
    const profile: PatientProfile = yield call(patientApi.getProfile);
    yield put(loadProfileSucceeded(profile));
  } catch (error) {
    yield put(loadProfileFailed(extractErrorMessage(error)));
  }
}

function* handleUpdateProfile(action: PayloadAction<Partial<PatientProfile>>) {
  try {
    const profile: PatientProfile = yield call(patientApi.updateProfile, action.payload);
    yield put(updateProfileSucceeded(profile));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateProfileFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleRateConsultation(
  action: PayloadAction<{
    consultationId: string;
    doctorId: string;
    rating: number;
    comment?: string;
  }>
) {
  try {
    const rating: Rating = yield call(patientApi.rateConsultation, action.payload);
    yield put(rateConsultationSucceeded(rating));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Rating submitted successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(rateConsultationFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleCancelAppointment(action: PayloadAction<string>) {
  try {
    yield call(patientApi.cancelAppointment, action.payload);
    yield put(cancelAppointmentSucceeded(action.payload));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Appointment cancelled' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(cancelAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadSpecialties() {
  try {
    const specialties: Specialty[] = yield call(patientApi.getSpecialties);
    yield put(loadSpecialtiesSucceeded(specialties));
  } catch (error) {
    yield put(loadSpecialtiesFailed(extractErrorMessage(error)));
  }
}

function* handleLoadDoctorsBySpecialty(action: PayloadAction<string>) {
  try {
    const doctors: Doctor[] = yield call(patientApi.getDoctorsBySpecialty, action.payload);
    yield put(loadDoctorsBySpecialtySucceeded(doctors));
  } catch (error) {
    yield put(loadDoctorsBySpecialtyFailed(extractErrorMessage(error)));
  }
}

export function* patientSaga() {
  yield takeLatest(askQuestionRequested.type, handleAskQuestion);
  yield takeLatest(bookAppointmentRequested.type, handleBookAppointment);
  yield takeLatest(cancelAppointmentRequested.type, handleCancelAppointment);
  yield debounce(500, loadHistoryRequested.type, handleLoadHistory);
  yield takeLatest(loadProfileRequested.type, handleLoadProfile);
  yield takeLatest(updateProfileRequested.type, handleUpdateProfile);
  yield takeLatest(rateConsultationRequested.type, handleRateConsultation);
  yield takeLatest(loadSpecialtiesRequested.type, handleLoadSpecialties);
  yield takeLatest(loadDoctorsBySpecialtyRequested.type, handleLoadDoctorsBySpecialty);
}
