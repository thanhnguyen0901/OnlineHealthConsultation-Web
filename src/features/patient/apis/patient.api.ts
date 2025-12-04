import apiClient from '@/apis/core/apiClient';
import type { Question, Appointment } from '../types';

export const askQuestion = async (data: { question: string; specialtyId?: string }): Promise<Question> => {
  const response = await apiClient.post<Question>('/patient/questions', data);
  return response.data;
};

export const bookAppointment = async (data: { doctorId: string; date: string; time: string; notes?: string }): Promise<Appointment> => {
  const response = await apiClient.post<Appointment>('/patient/appointments', data);
  return response.data;
};

export const getHistory = async (): Promise<{ questions: Question[]; appointments: Appointment[] }> => {
  const [questionsRes, appointmentsRes] = await Promise.all([
    apiClient.get<Question[]>('/patient/questions'),
    apiClient.get<Appointment[]>('/patient/appointments'),
  ]);
  return {
    questions: questionsRes.data,
    appointments: appointmentsRes.data,
  };
};
