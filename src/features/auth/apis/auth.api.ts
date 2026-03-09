import apiClient from '@/apis/core/apiClient';
import { performRefresh } from '@/apis/core/refreshManager';
import type { User } from '@/types/common';

interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

export interface AuthResult {
  user: User;
  accessToken: string;
}

const normalizeUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  firstName: backendUser.firstName,
  lastName: backendUser.lastName,
  name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
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
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR';
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

// Passes Authorization header directly; avoids POST /auth/refresh when sessionStorage already has a valid token.
export const meWithToken = async (accessToken: string): Promise<AuthResult> => {
  const response = await apiClient.get<{ data: BackendUser }>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    user: normalizeUser(response.data.data),
    accessToken, // carry the same token forward into Redux
  };
};

export const refresh = async (): Promise<AuthResult> => {
  // performRefresh() is single-flight: concurrent callers share the same in-flight Promise.
  const { accessToken, user } = await performRefresh();
  return { accessToken, user };
};
