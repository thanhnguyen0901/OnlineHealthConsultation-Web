import apiClient from '@/apis/core/apiClient';
import type {
  AppointmentChartRow,
  QuestionChartRow,
  Statistics,
  ChartData,
  ReportData,
} from '../types';

// Backward-compat alias: wraps getStatistics() result as a single ReportData row keyed by today's date.
export const getReports = async (_params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReportData[]> => {
  const stats = await getStatistics();
  const today = new Date().toISOString().split('T')[0];
  return [{ date: today, ...stats } as unknown as ReportData];
};

export const getStatistics = async (): Promise<Statistics> => {
  const response = await apiClient.get<{ data: Statistics }>('/reports/stats');
  return response.data.data;
};

export const getAppointmentsChart = async (params?: {
  from?: string;
  to?: string;
}): Promise<AppointmentChartRow[]> => {
  const response = await apiClient.get<{ data: AppointmentChartRow[] }>(
    '/reports/appointments-chart',
    { params }
  );
  return response.data.data;
};

export const getQuestionsChart = async (params?: {
  from?: string;
  to?: string;
}): Promise<QuestionChartRow[]> => {
  const response = await apiClient.get<{ data: QuestionChartRow[] }>('/reports/questions-chart', {
    params,
  });
  return response.data.data;
};

export const getTopDoctors = async (
  limit?: number
): Promise<
  {
    id: string;
    doctorName: string;
    specialty: string;
    ratingAverage: number;
    ratingCount: number;
    yearsOfExperience: number;
  }[]
> => {
  const response = await apiClient.get('/reports/top-doctors', {
    params: limit ? { limit } : undefined,
  });
  return response.data.data;
};

export const getSpecialtyDistribution = async (): Promise<ChartData[]> => {
  const response = await apiClient.get<{
    data: { name: string; doctorCount: number }[];
  }>('/reports/specialty-distribution');
  return response.data.data.map((s) => ({ name: s.name, value: s.doctorCount }));
};
