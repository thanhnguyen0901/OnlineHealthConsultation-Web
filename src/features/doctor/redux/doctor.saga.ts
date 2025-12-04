import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loadQuestionsRequested,
  loadQuestionsSucceeded,
  loadQuestionsFailed,
  answerQuestionRequested,
  answerQuestionSucceeded,
  answerQuestionFailed,
  loadScheduleRequested,
  loadScheduleSucceeded,
  loadScheduleFailed,
} from './doctor.slice';
import * as doctorApi from '../apis/doctor.api';
import type { DoctorQuestion, Schedule } from '../types';

function* handleLoadQuestions() {
  try {
    const questions: DoctorQuestion[] = yield call(doctorApi.getQuestions);
    yield put(loadQuestionsSucceeded(questions));
  } catch (error) {
    yield put(loadQuestionsFailed((error as Error).message));
  }
}

function* handleAnswerQuestion(action: PayloadAction<{ questionId: string; answer: string }>) {
  try {
    yield call(doctorApi.answerQuestion, action.payload);
    yield put(answerQuestionSucceeded({ questionId: action.payload.questionId }));
  } catch (error) {
    yield put(answerQuestionFailed((error as Error).message));
  }
}

function* handleLoadSchedule() {
  try {
    const schedules: Schedule[] = yield call(doctorApi.getSchedule);
    yield put(loadScheduleSucceeded(schedules));
  } catch (error) {
    yield put(loadScheduleFailed((error as Error).message));
  }
}

export function* doctorSaga() {
  yield takeLatest(loadQuestionsRequested.type, handleLoadQuestions);
  yield takeLatest(answerQuestionRequested.type, handleAnswerQuestion);
  yield takeLatest(loadScheduleRequested.type, handleLoadSchedule);
}
