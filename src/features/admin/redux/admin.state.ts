import type { User } from '@/types/common';
import type { Doctor, Patient, Specialty, AdminStats } from '../types';
import type { PaginationMeta } from '../apis/admin.api';

export interface AdminState {
  users: User[];
  usersPagination: PaginationMeta | null;
  patients: Patient[];
  patientsPagination: PaginationMeta | null;
  doctors: Doctor[];
  doctorsPagination: PaginationMeta | null;
  specialties: Specialty[];
  appointments: any[];
  appointmentsPagination: PaginationMeta | null;
  moderationItems: any[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  users: [],
  usersPagination: null,
  patients: [],
  patientsPagination: null,
  doctors: [],
  doctorsPagination: null,
  specialties: [],
  appointments: [],
  appointmentsPagination: null,
  moderationItems: [],
  stats: null,
  loading: false,
  error: null,
};
