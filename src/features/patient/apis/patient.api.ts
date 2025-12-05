import apiClient from '@/apis/core/apiClient';
import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';

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

export const getProfile = async (): Promise<PatientProfile> => {
  const response = await apiClient.get<PatientProfile>('/patient/profile');
  return response.data;
};

export const updateProfile = async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
  const response = await apiClient.put<PatientProfile>('/patient/profile', data);
  return response.data;
};

export const rateConsultation = async (data: { consultationId: string; rating: number; comment?: string }): Promise<Rating> => {
  const response = await apiClient.post<Rating>('/patient/ratings', data);
  return response.data;
};

export const getRatings = async (): Promise<Rating[]> => {
  const response = await apiClient.get<Rating[]>('/patient/ratings');
  return response.data;
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<Specialty[]>('/admin/specialties');
  return response.data;
};

export const getDoctorsBySpecialty = async (specialtyId: string): Promise<Doctor[]> => {
  const response = await apiClient.get<Doctor[]>(`/admin/doctors?specialtyId=${specialtyId}`);
  return response.data;
};
