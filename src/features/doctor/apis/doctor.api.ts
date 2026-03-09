import apiClient from '@/apis/core/apiClient';
import type { DoctorQuestion, DoctorProfile, Schedule } from '../types';

export const getMe = async (): Promise<DoctorProfile> => {
  const response = await apiClient.get<{ data: DoctorProfile }>('/doctors/me');
  return response.data.data;
};

export const getQuestions = async (): Promise<DoctorQuestion[]> => {
  const response = await apiClient.get<{ data: DoctorQuestion[] }>('/doctors/questions');
  return response.data.data;
};

export const answerQuestion = async (data: {
  questionId: string;
  answer: string;
}): Promise<void> => {
  // Endpoint uses plural /answers, not /answer.
  await apiClient.post(`/doctors/questions/${data.questionId}/answers`, { answer: data.answer });
};

export const getSchedule = async (): Promise<Schedule[]> => {
  const response = await apiClient.get<{ data: Schedule[] }>('/doctors/schedule');
  return response.data.data;
};

export const updateSchedule = async (schedule: Schedule[]): Promise<void> => {
  await apiClient.post('/doctors/schedule', { schedule });
};

export const getAppointments = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: unknown[]; meta?: unknown }> => {
  const response = await apiClient.get('/doctors/appointments', { params });
  return response.data;
};

export const updateAppointment = async (
  id: string,
  body: { status?: string; scheduledAt?: string; notes?: string }
): Promise<unknown> => {
  const response = await apiClient.put(`/doctors/appointments/${id}`, body);
  return response.data.data;
};

export const rescheduleAppointment = async (id: string, scheduledAt: string): Promise<unknown> => {
  const response = await apiClient.put(`/doctors/appointments/${id}`, { scheduledAt });
  return response.data.data;
};

export const getRatings = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: unknown[]; meta?: unknown }> => {
  const response = await apiClient.get('/doctors/ratings', { params });
  return response.data;
};

export const updateProfile = async (data: {
  bio?: string;
  yearsOfExperience?: number;
  specialtyId?: string;
}): Promise<unknown> => {
  const response = await apiClient.patch('/doctors/me', data);
  return response.data.data;
};
