import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpError } from './httpError';
import { storage } from '@/utils/storage';
import { API_CONFIG } from '@/config/api.config';
import { ROUTE_PATHS } from '@/constants/routePaths';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL) + '/api',
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach access token to Authorization header
    const accessToken = storage.get<string>('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle forbidden access
    if (error.response?.status === 403) {
      window.location.href = ROUTE_PATHS.HOME;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send empty body - backend will get refreshToken from httpOnly cookie
        const refreshResponse = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; refreshToken?: string };
        }>('/auth/refresh', {});

        // Save new access token
        const newAccessToken = refreshResponse.data.data.accessToken;
        storage.set('accessToken', newAccessToken);

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        // Clear token and redirect to login
        storage.remove('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
