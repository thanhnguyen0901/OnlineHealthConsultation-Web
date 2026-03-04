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

// The single-flight refresh lock (formerly isRefreshing / refreshQueue /
// processQueue) lives in refreshManager.ts so the Axios interceptor and the
// Redux-Saga bootstrap path share the same mutual-exclusion primitive.

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
      // Skip refresh for auth endpoints (and /auth/me used by the bootstrap
      // fallback) to avoid infinite retry loops.
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
        // performRefresh() is single-flight: if the saga bootstrap has already
        // started a refresh, this call joins that in-flight Promise and no
        // additional POST /auth/refresh request is issued.
        // On success, the manager dispatches setAccessToken to the Redux store
        // so the request interceptor attaches the new token to the retry.
        await performRefresh();
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear local auth state and send the user to login.
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
