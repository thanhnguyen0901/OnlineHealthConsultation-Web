import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialReportsState } from './reports.state';
import type { ReportData } from '../types';

const reportsSlice = createSlice({
  name: 'reports',
  initialState: initialReportsState,
  reducers: {
    loadReportsRequested: (state, _action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
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
  },
});

export const { loadReportsRequested, loadReportsSucceeded, loadReportsFailed } = reportsSlice.actions;

export default reportsSlice.reducer;
