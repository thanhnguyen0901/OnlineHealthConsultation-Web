import type { ReportData, Statistics } from '../types';

export interface ReportsState {
  data: ReportData[];
  statistics: Statistics | null;
  appointmentsChart: ReportData[];
  loading: boolean;
  error: string | null;
}

export const initialReportsState: ReportsState = {
  data: [],
  statistics: null,
  appointmentsChart: [],
  loading: false,
  error: null,
};
