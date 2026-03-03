import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loadProfileRequested,
  loadProfileSucceeded,
  loadProfileFailed,
  loadQuestionsRequested,
  loadQuestionsSucceeded,
  loadQuestionsFailed,
  answerQuestionRequested,
  answerQuestionSucceeded,
  answerQuestionFailed,
  loadDoctorAppointmentsRequested,
  loadDoctorAppointmentsSucceeded,
  loadDoctorAppointmentsFailed,
  updateDoctorAppointmentRequested,
  updateDoctorAppointmentSucceeded,
  updateDoctorAppointmentFailed,
  loadScheduleRequested,
  loadScheduleSucceeded,
  loadScheduleFailed,
  loadRatingsRequested,
  loadRatingsSucceeded,
  loadRatingsFailed,
  updateProfileRequested,
  updateProfileSucceeded,
  updateProfileFailed,
  updateScheduleRequested,
  updateScheduleSucceeded,
  updateScheduleFailed,
  rescheduleAppointmentRequested,
  rescheduleAppointmentSucceeded,
  rescheduleAppointmentFailed,
  type UpdateProfilePayload,
} from './doctor.slice';
import * as doctorApi from '../apis/doctor.api';
import type { DoctorQuestion, DoctorAppointment, DoctorProfile, DoctorRating, RatingsPagination, Schedule } from '../types';
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';

function* handleLoadProfile() {
  try {
    const profile: DoctorProfile = yield call(doctorApi.getMe);
    yield put(loadProfileSucceeded(profile));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(loadProfileFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadQuestions() {
  try {
    const questions: DoctorQuestion[] = yield call(doctorApi.getQuestions);
    yield put(loadQuestionsSucceeded(questions));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(loadQuestionsFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleAnswerQuestion(action: PayloadAction<{ questionId: string; answer: string }>) {
  try {
    yield call(doctorApi.answerQuestion, action.payload);
    yield put(answerQuestionSucceeded({ questionId: action.payload.questionId }));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Answer submitted successfully' }));
    // Re-sync from server so answered question appears with correct status.
    yield put(loadQuestionsRequested());
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(answerQuestionFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadDoctorAppointments(
  action: PayloadAction<{ status?: string } | undefined>
) {
  try {
    const result: { data: DoctorAppointment[]; meta?: unknown } = yield call(
      doctorApi.getAppointments,
      action.payload
    );
    // BE returns { data: [...], meta: pagination } but we just need the array
    const appointments = Array.isArray(result) ? result : (result as any).data ?? result;
    yield put(loadDoctorAppointmentsSucceeded(appointments as DoctorAppointment[]));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(loadDoctorAppointmentsFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateDoctorAppointment(
  action: PayloadAction<{ id: string; status: string; notes?: string }>
) {
  try {
    const result: unknown = yield call(doctorApi.updateAppointment, action.payload.id, {
      status: action.payload.status,
      notes: action.payload.notes,
    });
    yield put(updateDoctorAppointmentSucceeded(result as DoctorAppointment));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Appointment updated' }));
    // Resync the full list to ensure consistent state
    yield put(loadDoctorAppointmentsRequested());
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateDoctorAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadSchedule() {
  try {
    const schedules: Schedule[] = yield call(doctorApi.getSchedule);
    yield put(loadScheduleSucceeded(schedules));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(loadScheduleFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleLoadRatings(action: PayloadAction<{ page?: number; limit?: number } | undefined>) {
  try {
    const result: { data: unknown[]; meta?: unknown } = yield call(
      doctorApi.getRatings,
      action.payload
    );
    const ratings: DoctorRating[] = (Array.isArray(result) ? result : (result as any).data ?? []) as DoctorRating[];
    const pagination = (result as any).meta as RatingsPagination | null ?? null;
    yield put(loadRatingsSucceeded({ ratings, pagination }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(loadRatingsFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateProfile(action: PayloadAction<UpdateProfilePayload>) {
  try {
    yield call(doctorApi.updateProfile, action.payload);
    // Reload the full profile from server so specialty object + stats are fresh.
    const freshProfile: DoctorProfile = yield call(doctorApi.getMe);
    yield put(updateProfileSucceeded(freshProfile));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateProfileFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleUpdateSchedule(action: PayloadAction<Schedule[]>) {
  try {
    yield call(doctorApi.updateSchedule, action.payload);
    // Reload from server for authoritative order
    const schedules: Schedule[] = yield call(doctorApi.getSchedule);
    yield put(updateScheduleSucceeded(schedules));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Schedule saved successfully' }));
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(updateScheduleFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

function* handleRescheduleAppointment(
  action: PayloadAction<{ id: string; scheduledAt: string }>
) {
  try {
    const result: unknown = yield call(
      doctorApi.rescheduleAppointment,
      action.payload.id,
      action.payload.scheduledAt
    );
    yield put(rescheduleAppointmentSucceeded(result as DoctorAppointment));
    yield put(addToast({ severity: 'success', summary: 'Success', detail: 'Appointment rescheduled successfully' }));
    // Reload full list to ensure consistency
    yield put(loadDoctorAppointmentsRequested());
  } catch (error) {
    const msg = extractErrorMessage(error);
    yield put(rescheduleAppointmentFailed(msg));
    yield put(addToast({ severity: 'error', summary: 'Error', detail: msg }));
  }
}

export function* doctorSaga() {
  yield takeLatest(loadProfileRequested.type, handleLoadProfile);
  yield takeLatest(loadQuestionsRequested.type, handleLoadQuestions);
  yield takeLatest(answerQuestionRequested.type, handleAnswerQuestion);
  yield takeLatest(loadDoctorAppointmentsRequested.type, handleLoadDoctorAppointments);
  yield takeLatest(updateDoctorAppointmentRequested.type, handleUpdateDoctorAppointment);
  yield takeLatest(loadScheduleRequested.type, handleLoadSchedule);
  yield takeLatest(loadRatingsRequested.type, handleLoadRatings);
  yield takeLatest(updateProfileRequested.type, handleUpdateProfile);
  yield takeLatest(updateScheduleRequested.type, handleUpdateSchedule);
  yield takeLatest(rescheduleAppointmentRequested.type, handleRescheduleAppointment);
}
