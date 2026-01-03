import apiClient from '@/apis/core/apiClient';
import type { ReportData, Statistics, ChartData } from '../types';

export const getReports = async (params: { startDate?: string; endDate?: string }): Promise<ReportData[]> => {
  const response = await apiClient.get<{ data: ReportData[] }>('/reports', { params });
  return response.data.data;
};

export const getStatistics = async (): Promise<Statistics> => {
  const response = await apiClient.get<{ data: Statistics }>('/reports/statistics');
  return response.data.data;
};

export const getAppointmentsChart = async (): Promise<ReportData[]> => {
  const response = await apiClient.get<{ data: ReportData[] }>('/reports/appointments-chart');
  return response.data.data;
};

export const getQuestionsChart = async (): Promise<ChartData[]> => {
  const response = await apiClient.get<{ data: ChartData[] }>('/reports/questions-chart');
  return response.data.data;
};
