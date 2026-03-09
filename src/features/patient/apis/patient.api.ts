import apiClient from '@/apis/core/apiClient';
import type { Question, Appointment, PatientProfile, Rating } from '../types';
import type { Doctor, Specialty } from '@/features/admin/types';
import type { Id } from '@/types/common';

interface BackendDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'DOCTOR';
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
  isActive: boolean;
}

const normalizeDoctor = (backendDoctor: BackendDoctor): Doctor => ({
  ...backendDoctor,
  name: `${backendDoctor.firstName} ${backendDoctor.lastName}`.trim(),
});

export const askQuestion = async (data: {
  question: string;
  specialtyId?: string;
}): Promise<Question> => {
  const response = await apiClient.post<{ data: Question }>('/patients/questions', data);
  return response.data.data;
};

export const bookAppointment = async (data: {
  doctorId: string;
  // UTC ISO-8601 string.
  scheduledAt: string;
  reason: string;
  notes?: string;
}): Promise<Appointment> => {
  const response = await apiClient.post<{ data: Appointment }>('/patients/appointments', data);
  return response.data.data;
};

export const getHistory = async (): Promise<{
  questions: Question[];
  appointments: Appointment[];
}> => {
  const response = await apiClient.get<{
    data: { questions: Question[]; appointments: Appointment[] };
  }>('/patients/history');
  return response.data.data;
};

const normalizeGender = (profile: PatientProfile): PatientProfile => ({
  ...profile,
  gender: profile.gender
    ? (profile.gender.toLowerCase() as 'male' | 'female' | 'other')
    : undefined,
});

export const getProfile = async (): Promise<PatientProfile> => {
  const response = await apiClient.get<{ data: PatientProfile }>('/patients/profile');
  return normalizeGender(response.data.data);
};

export const updateProfile = async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
  const response = await apiClient.put<{ data: PatientProfile }>('/patients/profile', data);
  return normalizeGender(response.data.data);
};

export const rateConsultation = async (data: {
  consultationId: string;
  doctorId: string;
  rating: number;
  comment?: string;
}): Promise<Rating> => {
  const response = await apiClient.post<{ data: Rating }>('/patients/ratings', data);
  return response.data.data;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  await apiClient.patch(`/patients/appointments/${id}/cancel`);
};

export const getRatings = async (): Promise<Rating[]> => {
  const response = await apiClient.get<{ data: Rating[] }>('/patients/ratings');
  return response.data.data;
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<{ data: Specialty[] }>('/patients/specialties');
  return response.data.data;
};

export const getDoctorsBySpecialty = async (specialtyId: string): Promise<Doctor[]> => {
  const response = await apiClient.get<{ data: BackendDoctor[] }>(
    `/patients/doctors?specialtyId=${specialtyId}`
  );
  return response.data.data.map(normalizeDoctor);
};
