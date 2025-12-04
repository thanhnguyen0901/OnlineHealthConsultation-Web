import apiClient from '@/apis/core/apiClient';
import type { DoctorQuestion, Schedule } from '../types';

export const getQuestions = async (): Promise<DoctorQuestion[]> => {
  const response = await apiClient.get<DoctorQuestion[]>('/doctor/questions');
  return response.data;
};

export const answerQuestion = async (data: { questionId: string; answer: string }): Promise<void> => {
  await apiClient.post(`/doctor/questions/${data.questionId}/answer`, { answer: data.answer });
};

export const getSchedule = async (): Promise<Schedule[]> => {
  const response = await apiClient.get<Schedule[]>('/doctor/schedule');
  return response.data;
};
