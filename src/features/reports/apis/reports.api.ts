import apiClient from '@/apis/core/apiClient';
import type { ReportData } from '../types';

export const getReports = async (params: { startDate?: string; endDate?: string }): Promise<ReportData[]> => {
  const response = await apiClient.get<ReportData[]>('/reports', { params });
  return response.data;
};
