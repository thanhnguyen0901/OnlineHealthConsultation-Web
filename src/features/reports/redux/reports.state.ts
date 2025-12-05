import type { ReportData, Statistics, ChartData } from '../types';

export interface ReportsState {
  data: ReportData[];
  statistics: Statistics | null;
  appointmentsChart: ReportData[];
  questionsChart: ChartData[];
  loading: boolean;
  error: string | null;
}

export const initialReportsState: ReportsState = {
  data: [],
  statistics: null,
  appointmentsChart: [],
  questionsChart: [],
  loading: false,
  error: null,
};
