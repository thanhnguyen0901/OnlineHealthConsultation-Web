import type { User } from '@/types/common';
import type { Doctor, Specialty, AdminStats } from '../types';

export interface AdminState {
  users: User[];
  doctors: Doctor[];
  specialties: Specialty[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  users: [],
  doctors: [],
  specialties: [],
  stats: null,
  loading: false,
  error: null,
};
