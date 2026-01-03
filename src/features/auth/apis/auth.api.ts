import apiClient from '@/apis/core/apiClient';
import type { User } from '@/types/common';
import { storage } from '@/utils/storage';

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isActive?: boolean;
  patientProfile?: any;
  doctorProfile?: any;
}

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: BackendUser;
  };
}

// Normalize backend user to frontend User type
const normalizeUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  name: backendUser.fullName,
  role: backendUser.role,
});

export const login = async (credentials: { email: string; password: string }): Promise<User> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  // Save access token to localStorage
  storage.set('accessToken', response.data.data.accessToken);
  return normalizeUser(response.data.data.user);
};

export const register = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  // Save access token to localStorage
  storage.set('accessToken', response.data.data.accessToken);
  return normalizeUser(response.data.data.user);
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  // Clear access token
  storage.remove('accessToken');
};

export const me = async (): Promise<User> => {
  const response = await apiClient.get<{ data: BackendUser }>('/auth/me');
  return normalizeUser(response.data.data);
};
