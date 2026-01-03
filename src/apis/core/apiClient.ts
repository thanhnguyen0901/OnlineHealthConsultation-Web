import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpError } from './httpError';
import { API_CONFIG } from '@/config/api.config';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { store } from '@/state/store';
import { selectAccessToken } from '@/features/auth/redux/auth.selectors';
import { setAccessToken, logoutSucceeded } from '@/features/auth/redux/auth.slice';

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
    // Get access token from Redux store (in-memory)
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

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry original request with new token from store
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh access token using HttpOnly cookie
        const refreshResponse = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; refreshToken?: string };
        }>('/auth/refresh', {});

        const newAccessToken = refreshResponse.data.data.accessToken;
        
        // Update Redux store with new access token
        store.dispatch(setAccessToken(newAccessToken));

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError as Error, null);
        
        // Clear auth state and redirect to login
        store.dispatch(logoutSucceeded());
        window.location.href = ROUTE_PATHS.LOGIN;
        
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
