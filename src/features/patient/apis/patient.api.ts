import apiClient from '@/apis/core/apiClient';
import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';
import type { Id } from '@/types/common';

interface BackendDoctor {
  id: string;
  fullName: string;
  email: string;
  role: 'DOCTOR';
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
  isActive: boolean;
}

const normalizeDoctor = (backendDoctor: BackendDoctor): Doctor => ({
  ...backendDoctor,
  name: backendDoctor.fullName,
});

export const askQuestion = async (data: {
  question: string;
  specialtyId?: string;
}): Promise<Question> => {
  const response = await apiClient.post<{ data: Question }>('/patient/questions', data);
  return response.data.data;
};

export const bookAppointment = async (data: {
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<Appointment> => {
  const response = await apiClient.post<{ data: Appointment }>('/patient/appointments', data);
  return response.data.data;
};

export const getHistory = async (): Promise<{
  questions: Question[];
  appointments: Appointment[];
}> => {
  const response = await apiClient.get<{
    data: { questions: Question[]; appointments: Appointment[] };
  }>('/patient/history');
  return response.data.data;
};

export const getProfile = async (): Promise<PatientProfile> => {
  const response = await apiClient.get<{ data: PatientProfile }>('/patient/profile');
  return response.data.data;
};

export const updateProfile = async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
  const response = await apiClient.put<{ data: PatientProfile }>('/patient/profile', data);
  return response.data.data;
};

export const rateConsultation = async (data: {
  consultationId: string;
  doctorId: string;
  rating: number;
  comment?: string;
}): Promise<Rating> => {
  const response = await apiClient.post<{ data: Rating }>('/patient/ratings', data);
  return response.data.data;
};

export const getRatings = async (): Promise<Rating[]> => {
  const response = await apiClient.get<{ data: Rating[] }>('/patient/ratings');
  return response.data.data;
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<{ data: Specialty[] }>('/patient/specialties');
  return response.data.data;
};

export const getDoctorsBySpecialty = async (specialtyId: string): Promise<Doctor[]> => {
  const response = await apiClient.get<{ data: BackendDoctor[] }>(
    `/patient/doctors?specialtyId=${specialtyId}`
  );
  return response.data.data.map(normalizeDoctor);
};
