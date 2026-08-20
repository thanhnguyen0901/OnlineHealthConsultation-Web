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
} from './reports.slice';
import * as reportsApi from '../apis/reports.api';
import type { ReportData, Statistics, ReportFilters } from '../types';

function* handleLoadReports(
  action: PayloadAction<ReportFilters | undefined>
): Generator<any, void, any> {
  try {
    const data: ReportData[] = yield call(reportsApi.getReports, action.payload);
    yield put(loadReportsSucceeded(data));
  } catch (error) {
    yield put(loadReportsFailed((error as Error).message));
  }
}

function* handleLoadStatistics(action: PayloadAction<ReportFilters | undefined>): Generator<any, void, any> {
  try {
    const statistics: Statistics = yield call(reportsApi.getStatistics, action.payload);
    yield put(loadStatisticsSucceeded(statistics));
  } catch (error) {
    yield put(loadStatisticsFailed((error as Error).message));
  }
}

function* handleLoadAppointmentsChart(
  action: PayloadAction<ReportFilters | undefined>
): Generator<any, void, any> {
  try {
    const data: ReportData[] = yield call(reportsApi.getAppointmentsChart, action.payload);
    yield put(loadAppointmentsChartSucceeded(data));
  } catch (error) {
    yield put(loadAppointmentsChartFailed((error as Error).message));
  }
}

export function* reportsSaga() {
  yield takeLatest(loadReportsRequested.type, handleLoadReports);
  yield takeLatest(loadStatisticsRequested.type, handleLoadStatistics);
  yield takeLatest(loadAppointmentsChartRequested.type, handleLoadAppointmentsChart);
}
