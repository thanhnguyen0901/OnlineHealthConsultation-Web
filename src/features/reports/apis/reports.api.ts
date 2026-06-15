import apiClient from '@/apis/core/apiClient';
import type { Statistics, ChartData, ReportData } from '../types';

const unwrap = <T>(payload: T | { data: T }): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const normalizeStatistics = (raw: any): Statistics => {
  const statusCounts = (raw?.appointmentsByStatus ?? []).reduce(
    (acc: Record<string, number>, row: { status?: string; count?: number }) => {
      if (row.status) acc[row.status.toUpperCase()] = row.count ?? 0;
      return acc;
    },
    {}
  );

  return {
    totalUsers: raw?.totalUsers ?? raw?.totalActiveUsers ?? 0,
    totalDoctors: raw?.totalDoctors ?? raw?.totalActiveDoctors ?? 0,
    totalPatients: raw?.totalPatients ?? raw?.totalActivePatients ?? 0,
    totalSpecialties: raw?.totalSpecialties ?? 0,
    totalAppointments: raw?.totalAppointments ?? 0,
    totalQuestions: raw?.totalQuestions ?? 0,
    totalRatings: raw?.totalRatings ?? 0,
    pendingAppointments: raw?.pendingAppointments ?? statusCounts.PENDING ?? 0,
    completedAppointments: raw?.completedAppointments ?? statusCounts.COMPLETED ?? 0,
    answeredQuestions: raw?.answeredQuestions ?? 0,
    pendingQuestions: raw?.pendingQuestions ?? 0,
    activePatients: raw?.activePatients ?? raw?.totalActivePatients ?? 0,
    activeDoctors: raw?.activeDoctors ?? raw?.totalActiveDoctors ?? 0,
    totalActiveUsers: raw?.totalActiveUsers ?? 0,
  };
};

export const getReports = async (_params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReportData[]> => {
  const stats = await getStatistics();
  const today = new Date().toISOString().split('T')[0];
  return [{ date: today, ...stats } as unknown as ReportData];
};

export const getStatistics = async (): Promise<Statistics> => {
  const response = await apiClient.get('/reports/dashboard');
  return normalizeStatistics(unwrap(response.data));
};

export const getAppointmentsChart = async (params?: {
  from?: string;
  to?: string;
}): Promise<ReportData[]> => {
  const response = await apiClient.get('/reports/consultations/trend', {
    params: { ...params, groupBy: 'day' },
  });
  const payload: any = unwrap(response.data);
  const points = payload.points ?? [];

  return points.map((point: { bucket: string; count: number }) => ({
    date: point.bucket,
    appointments: point.count ?? 0,
    questions: 0,
  }));
};

export const getQuestionsChart = async (): Promise<ChartData[]> => {
  // TODO_BACKEND_API: current reporting backend exposes consultation trend but not question status chart.
  const stats = await getStatistics();
  return [
    { name: 'pending', value: stats.pendingQuestions },
    { name: 'answered', value: stats.answeredQuestions },
    { name: 'moderated', value: 0 },
  ];
};

export const getTopDoctors = async (): Promise<
  {
    id: string;
    doctorName: string;
    specialty: string;
    ratingAverage: number;
    ratingCount: number;
    yearsOfExperience: number;
  }[]
> => {
  // TODO_BACKEND_API: no top-doctors reporting endpoint in backend MVP.
  return [];
};

export const getSpecialtyDistribution = async (): Promise<ChartData[]> => {
  // TODO_BACKEND_API: no specialty-distribution reporting endpoint in backend MVP.
  return [];
};
