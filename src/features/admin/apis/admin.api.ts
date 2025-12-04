import apiClient from '@/apis/core/apiClient';
import type { User } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

export const getStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/admin/users');
  return response.data;
};

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get<Doctor[]>('/admin/doctors');
  return response.data;
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<Specialty[]>('/admin/specialties');
  return response.data;
};
