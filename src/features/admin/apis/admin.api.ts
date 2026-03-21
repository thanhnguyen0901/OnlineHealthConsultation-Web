import apiClient from '@/apis/core/apiClient';
import type { User, Id } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
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
  specialtyNameVi?: string;
  bio?: string;
}

const normalizeUser = (backendUser: BackendUser): User => ({
  ...backendUser,
  name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
});

const normalizeDoctor = (backendDoctor: BackendDoctor): Doctor => ({
  ...backendDoctor,
  name: `${backendDoctor.firstName} ${backendDoctor.lastName}`.trim(),
});

export const getStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<{ data: AdminStats }>('/reports/stats');
  return response.data.data;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const getUsers = async (params?: UserListParams): Promise<PagedResult<User>> => {
  const response = await apiClient.get<{ data: BackendUser[]; meta?: PaginationMeta }>(
    '/admin/users',
    { params }
  );
  return {
    data: (response.data.data ?? []).map(normalizeUser),
    pagination: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
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

export const getDoctors = async (params?: DoctorListParams): Promise<PagedResult<Doctor>> => {
  const response = await apiClient.get<{ data: BackendDoctor[]; meta?: PaginationMeta }>(
    '/admin/doctors',
    { params }
  );
  return {
    data: (response.data.data ?? []).map(normalizeDoctor),
    pagination: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
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

export interface BackendPatient {
  id: Id; // User.id
  profileId: Id; // PatientProfile.id
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'PATIENT';
}

import type { Patient } from '../types';

const normalizePatient = (p: BackendPatient): Patient => ({
  ...p,
  name: `${p.firstName} ${p.lastName}`.trim(),
});

export const getPatients = async (params?: PatientListParams): Promise<PagedResult<Patient>> => {
  const response = await apiClient.get<{ data: BackendPatient[]; meta?: PaginationMeta }>(
    '/admin/patients',
    { params }
  );
  return {
    data: (response.data.data ?? []).map(normalizePatient),
    pagination: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
};

export const updatePatient = async (id: Id, data: Partial<Patient>): Promise<Patient> => {
  const response = await apiClient.put<{ data: BackendPatient }>(`/admin/patients/${id}`, data);
  return normalizePatient(response.data.data);
};

export const createPatient = async (
  data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
  }
): Promise<Patient> => {
  const response = await apiClient.post<{ data: BackendPatient }>('/admin/patients', data);
  return normalizePatient(response.data.data);
};

export const deletePatient = async (id: Id): Promise<void> => {
  await apiClient.delete(`/admin/patients/${id}`);
};

export const getSpecialties = async (): Promise<Specialty[]> => {
  const response = await apiClient.get<{ data: Specialty[] }>('/specialties');
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

export interface Appointment {
  id: Id;
  patientId: Id;
  patientName: string;
  doctorId: Id;
  doctorName: string;
  specialtyId: Id;
  specialtyName: string;
  specialtyNameVi?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getAppointments = async (
  filters?: AppointmentFilters
): Promise<PagedResult<Appointment>> => {
  const params: Record<string, any> = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.status) params.status = filters.status;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  const response = await apiClient.get<{ data: Appointment[]; meta?: PaginationMeta }>(
    '/admin/appointments',
    { params }
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
};

export const updateAppointmentStatus = async (id: Id, status: string): Promise<Appointment> => {
  const response = await apiClient.put<{ data: Appointment }>(`/admin/appointments/${id}`, {
    status,
  });
  return response.data.data;
};

// id is composite "QUESTION_<uuid>" | "ANSWER_<uuid>" | "RATING_<uuid>"; pass as-is to approve/reject endpoints.
export interface ModerationItem {
  id: string;
  type: 'QUESTION' | 'ANSWER' | 'RATING';
  contentPreview: string;
  content: string;
  author: string;
  authorId: Id;
  createdAt: string;
  // QUESTION: "PENDING"|"ANSWERED"|"MODERATED" | ANSWER: "PENDING"|"APPROVED" | RATING: "VISIBLE"|"HIDDEN"
  status: string;
  entityId: Id;
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
