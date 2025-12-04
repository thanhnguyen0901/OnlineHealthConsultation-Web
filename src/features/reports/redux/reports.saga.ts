import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loadReportsRequested, loadReportsSucceeded, loadReportsFailed } from './reports.slice';
import * as reportsApi from '../apis/reports.api';
import type { ReportData } from '../types';

function* handleLoadReports(action: PayloadAction<{ startDate?: string; endDate?: string }>) {
  try {
    const data: ReportData[] = yield call(reportsApi.getReports, action.payload);
    yield put(loadReportsSucceeded(data));
  } catch (error) {
    yield put(loadReportsFailed((error as Error).message));
  }
}

export function* reportsSaga() {
  yield takeLatest(loadReportsRequested.type, handleLoadReports);
}
