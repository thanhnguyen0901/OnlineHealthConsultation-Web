import apiClient from '@/apis/core/apiClient';
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

interface RefreshResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
    user?: BackendUser;
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

export const refresh = async (): Promise<AuthResult> => {
  // POST /auth/refresh now returns { accessToken, user } in addition to setting
  // the rotated refreshToken in an httpOnly cookie.
  // We do NOT make a second GET /auth/me call — that was the source of the
  // double-refresh race that caused TOKEN_REUSE_DETECTED on page reload.
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', {});
  const { accessToken, user } = response.data.data;

  if (!user) {
    // Graceful fallback: if the server somehow omits user data (old BE version),
    // fetch it explicitly. This path should never be hit with the current BE.
    const meResponse = await apiClient.get<{ data: BackendUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { user: normalizeUser(meResponse.data.data), accessToken };
  }

  return { user: normalizeUser(user), accessToken };
};
