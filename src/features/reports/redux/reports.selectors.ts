import type { RootState } from '@/types/redux';

export const selectReports = (state: RootState) => state.reports;
export const selectReportsData = (state: RootState) => state.reports.data;
export const selectReportsStatistics = (state: RootState) => state.reports.statistics;
export const selectReportsAppointmentsChart = (state: RootState) => state.reports.appointmentsChart;
export const selectReportsQuestionsChart = (state: RootState) => state.reports.questionsChart;
export const selectReportsLoading = (state: RootState) => state.reports.loading;
