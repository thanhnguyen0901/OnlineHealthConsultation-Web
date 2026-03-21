import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpError } from './httpError';
import { performRefresh } from './refreshManager';
import { API_CONFIG } from '@/config/api.config';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { store } from '@/state/store';
import { selectAccessToken } from '@/features/auth/redux/auth.selectors';
import { logoutSucceeded } from '@/features/auth/redux/auth.slice';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL) + '/api',
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = selectAccessToken(store.getState());
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip auth endpoints to prevent infinite 401 retry loops.
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/me')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // performRefresh() is single-flight: concurrent callers share the same in-flight Promise; no duplicate POST /auth/refresh is issued.
        await performRefresh();
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logoutSucceeded());
        window.location.href = ROUTE_PATHS.LOGIN;
        return Promise.reject(refreshError);
      }
    }

    const apiError = error.response?.data as { message: string; code?: string };
    throw new HttpError(
      apiError?.message || error.message || 'An error occurred',
      error.response?.status || 500,
      apiError?.code
    );
  }
);

export default apiClient;
