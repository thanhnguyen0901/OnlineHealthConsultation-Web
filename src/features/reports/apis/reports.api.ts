import apiClient from '@/apis/core/apiClient';
import type { Statistics, ReportData, ReportFilters } from '../types';

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
    totalConsultations: raw?.totalConsultations ?? raw?.completedAppointments ?? 0,
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

const toBackendParams = (params?: ReportFilters) => ({
  from: params?.from,
  to: params?.to,
  groupBy: params?.groupBy,
});

export const getReports = async (params?: ReportFilters): Promise<ReportData[]> => {
  const stats = await getStatistics(params);
  const today = new Date().toISOString().split('T')[0];
  return [{ date: today, ...stats } as unknown as ReportData];
};

export const getStatistics = async (params?: ReportFilters): Promise<Statistics> => {
  const response = await apiClient.get('/reports/dashboard', { params: toBackendParams(params) });
  return normalizeStatistics(unwrap(response.data));
};

export const getAppointmentsChart = async (params?: ReportFilters): Promise<ReportData[]> => {
  const response = await apiClient.get('/reports/consultations/trend', {
    params: toBackendParams({ ...params, groupBy: params?.groupBy ?? 'day' }),
  });
  const payload: any = unwrap(response.data);
  const points = payload.points ?? [];

  return points.map((point: { bucket: string; count: number }) => ({
    date: point.bucket,
    consultations: point.count ?? 0,
  }));
};
