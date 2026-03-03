import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './doctor.slice';
import * as doctorApi from '../apis/doctor.api';
import type { DoctorQuestion, DoctorAppointment, Schedule } from '../types';
import { addToast } from '@/redux/slices/ui.slice';
import { extractErrorMessage } from '@/utils/errorMessage';

function* handleLoadQuestions() {
  try {
    const questions: DoctorQuestion[] = yield call(doctorApi.getQuestions);
    yield put(loadQuestionsSucceeded(questions));
  } catch (error) {
    yield put(loadQuestionsFailed(extractErrorMessage(error)));
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
    yield put(loadScheduleFailed(extractErrorMessage(error)));
  }
}

export function* doctorSaga() {
  yield takeLatest(loadQuestionsRequested.type, handleLoadQuestions);
  yield takeLatest(answerQuestionRequested.type, handleAnswerQuestion);
  yield takeLatest(loadDoctorAppointmentsRequested.type, handleLoadDoctorAppointments);
  yield takeLatest(updateDoctorAppointmentRequested.type, handleUpdateDoctorAppointment);
  yield takeLatest(loadScheduleRequested.type, handleLoadSchedule);
}
