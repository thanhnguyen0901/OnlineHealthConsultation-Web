import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpError } from './httpError';
import { storage } from '@/utils/storage';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000') + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (error: Error | null) => {
  refreshQueue.forEach((callback) => {
    if (error) {
      throw error;
    } else {
      callback('refreshed');
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token: string) => {
            if (token) {
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
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
        storage.set('accessToken', refreshResponse.data.data.accessToken);
        
        processQueue(null);
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
