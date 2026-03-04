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

/**
 * Bootstrap helper: call GET /auth/me with an explicitly provided access token.
 *
 * Used during app init when a valid token was found in sessionStorage — avoids
 * an unnecessary POST /auth/refresh call.  The Authorization header is passed
 * directly so the apiClient interceptor (which reads from the Redux store, which
 * is still empty at this point) does not need to have the token pre-loaded.
 */
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
  // Delegate to the shared single-flight refresh manager.
  // If the Axios 401 interceptor is already running a refresh at this moment,
  // performRefresh() returns the same in-flight Promise — no duplicate request.
  const { accessToken, user } = await performRefresh();
  return { accessToken, user };
};
