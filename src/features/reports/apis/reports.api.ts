import apiClient from '@/apis/core/apiClient';
import type { Statistics, ChartData, ReportData } from '../types';

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

type RawAppointmentsChartRow = {
  date: string;
  total: number;
};

type RawQuestionsChartRow = {
  date: string;
  total: number;
  pending: number;
  answered: number;
  moderated: number;
};

export const getAppointmentsChart = async (params?: {
  from?: string;
  to?: string;
}): Promise<ReportData[]> => {
  // Reports page expects each row to contain both "appointments" and "questions" keys.
  // Merge totals by date from two backend series to satisfy current FE contract.
  const [appointmentsRes, questionsRes] = await Promise.all([
    apiClient.get<{ data: RawAppointmentsChartRow[] }>('/reports/appointments-chart', { params }),
    apiClient.get<{ data: RawQuestionsChartRow[] }>('/reports/questions-chart', { params }),
  ]);

  const appointmentsByDate = new Map(
    (appointmentsRes.data.data ?? []).map((r) => [r.date, r.total] as const)
  );
  const questionsByDate = new Map(
    (questionsRes.data.data ?? []).map((r) => [r.date, r.total] as const)
  );

  const allDates = Array.from(
    new Set([...appointmentsByDate.keys(), ...questionsByDate.keys()])
  ).sort((a, b) => a.localeCompare(b));

  return allDates.map((date) => ({
    date,
    appointments: appointmentsByDate.get(date) ?? 0,
    questions: questionsByDate.get(date) ?? 0,
  }));
};

export const getQuestionsChart = async (params?: {
  from?: string;
  to?: string;
}): Promise<ChartData[]> => {
  const response = await apiClient.get<{ data: RawQuestionsChartRow[] }>(
    '/reports/questions-chart',
    {
      params,
    }
  );
  const rows = response.data.data ?? [];

  const totals = rows.reduce(
    (acc, row) => {
      acc.pending += row.pending ?? 0;
      acc.answered += row.answered ?? 0;
      acc.moderated += row.moderated ?? 0;
      return acc;
    },
    { pending: 0, answered: 0, moderated: 0 }
  );

  // Keep raw keys in state and localize at render time so runtime language switches update instantly.
  return [
    { name: 'pending', value: totals.pending },
    { name: 'answered', value: totals.answered },
    { name: 'moderated', value: totals.moderated },
  ];
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
