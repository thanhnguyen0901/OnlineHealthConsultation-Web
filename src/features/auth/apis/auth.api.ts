import apiClient from '@/apis/core/apiClient';
import type { User } from '@/types/common';

export const login = async (credentials: { email: string; password: string }): Promise<User> => {
  const response = await apiClient.post<User>('/auth/login', credentials);
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const me = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
