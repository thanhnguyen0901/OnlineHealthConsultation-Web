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
} from './patient.slice';
import * as patientApi from '../apis/patient.api';
import type { Question, Appointment } from '../types';

function* handleAskQuestion(action: PayloadAction<{ question: string; specialtyId?: string }>) {
  try {
    const question: Question = yield call(patientApi.askQuestion, action.payload);
    yield put(askQuestionSucceeded(question));
  } catch (error) {
    yield put(askQuestionFailed((error as Error).message));
  }
}

function* handleBookAppointment(action: PayloadAction<{ doctorId: string; date: string; time: string; notes?: string }>) {
  try {
    const appointment: Appointment = yield call(patientApi.bookAppointment, action.payload);
    yield put(bookAppointmentSucceeded(appointment));
  } catch (error) {
    yield put(bookAppointmentFailed((error as Error).message));
  }
}

function* handleLoadHistory() {
  try {
    const history: { questions: Question[]; appointments: Appointment[] } = yield call(patientApi.getHistory);
    yield put(loadHistorySucceeded(history));
  } catch (error) {
    yield put(loadHistoryFailed((error as Error).message));
  }
}

export function* patientSaga() {
  yield takeLatest(askQuestionRequested.type, handleAskQuestion);
  yield takeLatest(bookAppointmentRequested.type, handleBookAppointment);
  yield debounce(500, loadHistoryRequested.type, handleLoadHistory);
}
