import apiClient from '@/apis/core/apiClient';
import type { User, Id } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

interface BackendDoctor extends BackendUser {
  specialtyId: Id;
  specialtyName: string;
  bio?: string;
}

const normalizeUser = (backendUser: BackendUser): User => ({
  ...backendUser,
  name: backendUser.fullName,
});

const normalizeDoctor = (backendDoctor: BackendDoctor): Doctor => ({
  ...backendDoctor,
  name: backendDoctor.fullName,
});

export const getStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<{ data: AdminStats }>('/admin/stats');
  return response.data.data;
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<{ data: BackendUser[] }>('/admin/users');
  return response.data.data.map(normalizeUser);
};

export const createUser = async (data: Partial<User> & { password: string }): Promise<User> => {
  const response = await apiClient.post<{ data: BackendUser }>('/admin/users', data);
  return normalizeUser(response.data.data);
};

export const updateUser = async (id: Id, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<{ data: BackendUser }>(`/admin/users/${id}`, data);
  return normalizeUser(response.data.data);
};

export const deleteUser = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};

// Doctors API
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get<{ data: BackendDoctor[] }>('/admin/doctors');
  return response.data.data.map(normalizeDoctor);
};

export const createDoctor = async (
  data: Partial<Doctor> & { password: string }
): Promise<Doctor> => {
  const response = await apiClient.post<{ data: BackendDoctor }>('/admin/doctors', data);
  return normalizeDoctor(response.data.data);
};

export const updateDoctor = async (id: Id, data: Partial<Doctor>): Promise<Doctor> => {
  const response = await apiClient.put<{ data: BackendDoctor }>(`/admin/doctors/${id}`, data);
  return normalizeDoctor(response.data.data);
};

export const deleteDoctor = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/doctors/${id}`);
};

// Specialties API
export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<{ data: Specialty[] }>('/admin/specialties');
  return response.data.data;
};

export const createSpecialty = async (data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.post<{ data: Specialty }>('/admin/specialties', data);
  return response.data.data;
};

export const updateSpecialty = async (id: Id, data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.put<{ data: Specialty }>(`/admin/specialties/${id}`, data);
  return response.data.data;
};

export const deleteSpecialty = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/specialties/${id}`);
};

// Appointments API
export interface Appointment {
  id: Id;
  patientId: Id;
  patientName: string;
  doctorId: Id;
  doctorName: string;
  specialtyId: Id;
  specialtyName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get<{ data: Appointment[] }>('/admin/appointments');
  return response.data.data;
};

export const updateAppointmentStatus = async (id: Id, status: string): Promise<Appointment> => {
  const response = await apiClient.put<{ data: Appointment }>(`/admin/appointments/${id}`, { status });
  return response.data.data;
};

// Moderation API
export interface ModerationItem {
  id: Id;
  type: 'question' | 'answer';
  content: string;
  authorId: Id;
  authorName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const getModerationItems = async (): Promise<ModerationItem[]> => {
  const response = await apiClient.get<{ data: ModerationItem[] }>('/admin/moderation');
  return response.data.data;
};

export const approveModeration = async (id: Id): Promise<void> => {
  await apiClient.put(`/admin/moderation/${id}/approve`);
};

export const rejectModeration = async (id: Id): Promise<void> => {
  await apiClient.put(`/admin/moderation/${id}/reject`);
};
