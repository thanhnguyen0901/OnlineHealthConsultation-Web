import apiClient from '@/apis/core/apiClient';
import type { User } from '@/types/common';

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

interface RefreshResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

// Normalize backend user to frontend User type
const normalizeUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  name: backendUser.fullName,
  role: backendUser.role,
});

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return {
    user: normalizeUser(response.data.data.user),
    accessToken: response.data.data.accessToken,
  };
};

export const register = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResult> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return {
    user: normalizeUser(response.data.data.user),
    accessToken: response.data.data.accessToken,
  };
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const me = async (): Promise<AuthResult> => {
  const response = await apiClient.get<{ data: BackendUser }>('/auth/me');
  return {
    user: normalizeUser(response.data.data),
    accessToken: '', // Will be provided by silent refresh
  };
};

export const refresh = async (): Promise<AuthResult> => {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', {});
  // Backend should also return user data or we need to call /auth/me after refresh
  // For now, we'll call /auth/me to get user data
  const meResponse = await apiClient.get<{ data: BackendUser }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${response.data.data.accessToken}`,
    },
  });
  return {
    user: normalizeUser(meResponse.data.data),
    accessToken: response.data.data.accessToken,
  };
};
