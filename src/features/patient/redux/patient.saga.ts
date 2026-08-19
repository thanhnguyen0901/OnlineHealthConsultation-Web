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
  loadDoctorAvailabilityRequested,
  loadDoctorAvailabilitySucceeded,
  loadDoctorAvailabilityFailed,
} from './patient.slice';
import * as patientApi from '../apis/patient.api';
import type { Question, Appointment, PatientProfile, Rating, DoctorAvailability } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';
import i18n from '@/i18n/initI18n';

function* handleAskQuestion(
  action: PayloadAction<{ title: string; content: string; doctorId?: string }>
) {
  try {
    const question: Question = yield call(patientApi.askQuestion, action.payload);
    yield put(askQuestionSucceeded(question));
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('common:success'),
        detail: i18n.t('patient:questionSubmitted'),
      })
    );
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(askQuestionFailed(msg));
    yield put(addToast({ severity: 'error', summary: i18n.t('common:error'), detail: msg }));
  }
}

function* handleBookAppointment(
  action: PayloadAction<{ doctorId: string; scheduledAt: string; reason: string; notes?: string }>
) {
  try {
    const appointment: Appointment = yield call(patientApi.bookAppointment, action.payload);
    yield put(bookAppointmentSucceeded(appointment));
    yield put(loadHistoryRequested());
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('common:success'),
        detail: i18n.t('patient:appointmentBooked'),
      })
    );
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(bookAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: i18n.t('common:error'), detail: msg }));
  }
}

function* handleLoadDoctorAvailability(
  action: PayloadAction<{ doctorId: string; date: string; durationMinutes?: number }>
) {
  try {
    const availability: DoctorAvailability = yield call(
      patientApi.getDoctorAvailability,
      action.payload
    );
    yield put(loadDoctorAvailabilitySucceeded(availability));
  } catch (error) {
    yield put(loadDoctorAvailabilityFailed(extractErrorMessage(error)));
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
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('common:success'),
        detail: i18n.t('patient:profileUpdated'),
      })
    );
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateProfileFailed(msg));
    yield put(addToast({ severity: 'error', summary: i18n.t('common:error'), detail: msg }));
  }
}

function* handleRateConsultation(
  action: PayloadAction<{
    appointmentId: string;
    score: number;
    comment?: string;
  }>
) {
  try {
    const rating: Rating = yield call(patientApi.rateConsultation, action.payload);
    yield put(rateConsultationSucceeded(rating));
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('common:success'),
        detail: i18n.t('patient:ratingSubmitted'),
      })
    );
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(rateConsultationFailed(msg));
    yield put(addToast({ severity: 'error', summary: i18n.t('common:error'), detail: msg }));
  }
}

function* handleCancelAppointment(action: PayloadAction<string>) {
  try {
    yield call(patientApi.cancelAppointment, action.payload);
    yield put(cancelAppointmentSucceeded(action.payload));
    yield put(
      addToast({
        severity: 'success',
        summary: i18n.t('common:success'),
        detail: i18n.t('patient:appointmentCancelled'),
      })
    );
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(cancelAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: i18n.t('common:error'), detail: msg }));
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
  yield takeLatest(loadDoctorAvailabilityRequested.type, handleLoadDoctorAvailability);
}
