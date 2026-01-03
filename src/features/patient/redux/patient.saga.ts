import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  askQuestionRequested,
  askQuestionSucceeded,
  askQuestionFailed,
  bookAppointmentRequested,
  bookAppointmentSucceeded,
  bookAppointmentFailed,
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

function* handleAskQuestion(action: PayloadAction<{ question: string; specialtyId?: string }>) {
  try {
    const question: Question = yield call(patientApi.askQuestion, action.payload);
    yield put(askQuestionSucceeded(question));
  } catch (error) {
    yield put(askQuestionFailed((error as Error).message));
  }
}

function* handleBookAppointment(
  action: PayloadAction<{ doctorId: string; date: string; time: string; notes?: string }>
) {
  try {
    const appointment: Appointment = yield call(patientApi.bookAppointment, action.payload);
    yield put(bookAppointmentSucceeded(appointment));
  } catch (error) {
    yield put(bookAppointmentFailed((error as Error).message));
  }
}

function* handleLoadHistory() {
  try {
    const history: { questions: Question[]; appointments: Appointment[] } = yield call(
      patientApi.getHistory
    );
    yield put(loadHistorySucceeded(history));
  } catch (error) {
    yield put(loadHistoryFailed((error as Error).message));
  }
}

function* handleLoadProfile() {
  try {
    const profile: PatientProfile = yield call(patientApi.getProfile);
    yield put(loadProfileSucceeded(profile));
  } catch (error) {
    yield put(loadProfileFailed((error as Error).message));
  }
}

function* handleUpdateProfile(action: PayloadAction<Partial<PatientProfile>>) {
  try {
    const profile: PatientProfile = yield call(patientApi.updateProfile, action.payload);
    yield put(updateProfileSucceeded(profile));
  } catch (error) {
    yield put(updateProfileFailed((error as Error).message));
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
  } catch (error) {
    yield put(rateConsultationFailed((error as Error).message));
  }
}

function* handleLoadSpecialties() {
  try {
    const specialties: Specialty[] = yield call(patientApi.getSpecialties);
    yield put(loadSpecialtiesSucceeded(specialties));
  } catch (error) {
    yield put(loadSpecialtiesFailed((error as Error).message));
  }
}

function* handleLoadDoctorsBySpecialty(action: PayloadAction<string>) {
  try {
    const doctors: Doctor[] = yield call(patientApi.getDoctorsBySpecialty, action.payload);
    yield put(loadDoctorsBySpecialtySucceeded(doctors));
  } catch (error) {
    yield put(loadDoctorsBySpecialtyFailed((error as Error).message));
  }
}

export function* patientSaga() {
  yield takeLatest(askQuestionRequested.type, handleAskQuestion);
  yield takeLatest(bookAppointmentRequested.type, handleBookAppointment);
  yield debounce(500, loadHistoryRequested.type, handleLoadHistory);
  yield takeLatest(loadProfileRequested.type, handleLoadProfile);
  yield takeLatest(updateProfileRequested.type, handleUpdateProfile);
  yield takeLatest(rateConsultationRequested.type, handleRateConsultation);
  yield takeLatest(loadSpecialtiesRequested.type, handleLoadSpecialties);
  yield takeLatest(loadDoctorsBySpecialtyRequested.type, handleLoadDoctorsBySpecialty);
}
