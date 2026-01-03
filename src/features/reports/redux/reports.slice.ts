import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialReportsState } from './reports.state';
import type { ReportData, Statistics, ChartData } from '../types';

const reportsSlice = createSlice({
  name: 'reports',
  initialState: initialReportsState,
  reducers: {
    loadReportsRequested: (
      state,
      _action: PayloadAction<{ startDate?: string; endDate?: string }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    loadReportsSucceeded: (state, action: PayloadAction<ReportData[]>) => {
      state.loading = false;
      state.data = action.payload;
    },
    loadReportsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadStatisticsRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadStatisticsSucceeded: (state, action: PayloadAction<Statistics>) => {
      state.loading = false;
      state.statistics = action.payload;
    },
    loadStatisticsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadAppointmentsChartRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadAppointmentsChartSucceeded: (state, action: PayloadAction<ReportData[]>) => {
      state.loading = false;
      state.appointmentsChart = action.payload;
    },
    loadAppointmentsChartFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadQuestionsChartRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadQuestionsChartSucceeded: (state, action: PayloadAction<ChartData[]>) => {
      state.loading = false;
      state.questionsChart = action.payload;
    },
    loadQuestionsChartFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
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
} = reportsSlice.actions;

export default reportsSlice.reducer;
