import apiClient from '@/apis/core/apiClient';
import type { User, Id } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

export const getStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/admin/users');
  return response.data;
};

export const createUser = async (data: Partial<User> & { password: string }): Promise<User> => {
  const response = await apiClient.post<User>('/admin/users', data);
  return response.data;
};

export const updateUser = async (id: Id, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<User>(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};

// Doctors API
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get<Doctor[]>('/admin/doctors');
  return response.data;
};

export const createDoctor = async (
  data: Partial<Doctor> & { password: string }
): Promise<Doctor> => {
  const response = await apiClient.post<Doctor>('/admin/doctors', data);
  return response.data;
};

export const updateDoctor = async (id: Id, data: Partial<Doctor>): Promise<Doctor> => {
  const response = await apiClient.put<Doctor>(`/admin/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/doctors/${id}`);
};

// Specialties API
export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<Specialty[]>('/admin/specialties');
  return response.data;
};

export const createSpecialty = async (data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.post<Specialty>('/admin/specialties', data);
  return response.data;
};

export const updateSpecialty = async (id: Id, data: Partial<Specialty>): Promise<Specialty> => {
  const response = await apiClient.put<Specialty>(`/admin/specialties/${id}`, data);
  return response.data;
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
  const response = await apiClient.get<Appointment[]>('/admin/appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id: Id, status: string): Promise<Appointment> => {
  const response = await apiClient.put<Appointment>(`/admin/appointments/${id}`, { status });
  return response.data;
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
  const response = await apiClient.get<ModerationItem[]>('/admin/moderation');
  return response.data;
};

export const approveModeration = async (id: Id): Promise<void> => {
  await apiClient.put(`/admin/moderation/${id}/approve`);
};

export const rejectModeration = async (id: Id): Promise<void> => {
  await apiClient.put(`/admin/moderation/${id}/reject`);
};
