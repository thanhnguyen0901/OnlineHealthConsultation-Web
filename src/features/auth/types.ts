import type { User } from '@/types/common';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'DOCTOR';
}

export interface AuthResponse {
  user: User;
  token?: string;
}
