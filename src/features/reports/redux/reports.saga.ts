import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loadReportsRequested,
  loadReportsSucceeded,
  loadReportsFailed,
  loadStatisticsRequested,
  loadStatisticsSucceeded,
  loadStatisticsFailed,
  loadAppointmentsChartRequested,
  loadAppointmentsChartSucceeded,
  loadAppointmentsChartFailed,
  loadQuestionsChartRequested,
  loadQuestionsChartSucceeded,
  loadQuestionsChartFailed,
} from './reports.slice';
import * as reportsApi from '../apis/reports.api';
import type { ReportData, Statistics, ChartData } from '../types';

function* handleLoadReports(
  action: PayloadAction<{ startDate?: string; endDate?: string }>
): Generator<any, void, any> {
  try {
    const data: ReportData[] = yield call(reportsApi.getReports, action.payload);
    yield put(loadReportsSucceeded(data));
  } catch (error) {
    yield put(loadReportsFailed((error as Error).message));
  }
}

function* handleLoadStatistics(): Generator<any, void, any> {
  try {
    const statistics: Statistics = yield call(reportsApi.getStatistics);
    yield put(loadStatisticsSucceeded(statistics));
  } catch (error) {
    yield put(loadStatisticsFailed((error as Error).message));
  }
}

function* handleLoadAppointmentsChart(): Generator<any, void, any> {
  try {
    const data: ReportData[] = yield call(reportsApi.getAppointmentsChart);
    yield put(loadAppointmentsChartSucceeded(data));
  } catch (error) {
    yield put(loadAppointmentsChartFailed((error as Error).message));
  }
}

function* handleLoadQuestionsChart(): Generator<any, void, any> {
  try {
    const data: ChartData[] = yield call(reportsApi.getQuestionsChart);
    yield put(loadQuestionsChartSucceeded(data));
  } catch (error) {
    yield put(loadQuestionsChartFailed((error as Error).message));
  }
}

export function* reportsSaga() {
  yield takeLatest(loadReportsRequested.type, handleLoadReports);
  yield takeLatest(loadStatisticsRequested.type, handleLoadStatistics);
  yield takeLatest(loadAppointmentsChartRequested.type, handleLoadAppointmentsChart);
  yield takeLatest(loadQuestionsChartRequested.type, handleLoadQuestionsChart);
}
