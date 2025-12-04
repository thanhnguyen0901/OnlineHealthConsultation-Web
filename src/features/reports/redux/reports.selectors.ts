import type { RootState } from '@/types/redux';

export const selectReports = (state: RootState) => state.reports;
export const selectReportsData = (state: RootState) => state.reports.data;
export const selectReportsLoading = (state: RootState) => state.reports.loading;
