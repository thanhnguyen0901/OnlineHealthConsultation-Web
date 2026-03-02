import type { User } from '@/types/common';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'PATIENT' | 'DOCTOR';
}

export interface AuthResponse {
  user: User;
  token?: string;
}
