import type { ReportData } from '../types';

export interface ReportsState {
  data: ReportData[];
  loading: boolean;
  error: string | null;
}

export const initialReportsState: ReportsState = {
  data: [],
  loading: false,
  error: null,
};
