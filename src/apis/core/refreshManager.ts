import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { store } from '@/state/store';
import { setAccessToken } from '@/features/auth/redux/auth.slice';
import { saveAuthToStorage } from '@/utils/authStorage';
import type { User } from '@/types/common';

interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isActive?: boolean;
  patientProfile?: unknown;
  doctorProfile?: unknown;
}

interface RefreshApiResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
    user?: BackendUser;
  };
}

// Re-export so callers can type-check against AuthResult without importing auth.api
export interface AuthPayload {
  accessToken: string;
  user: User;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL) + '/api';

const debugLog = (...args: unknown[]) => {
  if (import.meta.env.VITE_DEBUG_REFRESH === 'true') {
    // eslint-disable-next-line no-console
    console.debug('[refreshManager]', ...args);
  }
};

const normalizeUser = (u: BackendUser): User => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  name: `${u.firstName} ${u.lastName}`.trim(),
  role: u.role,
});

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// TOKEN_ROTATED (409): grace-window race from a concurrent rotation; not a security alert — retry after a short delay.
const isTokenRotatedError = (err: unknown): boolean =>
  axios.isAxiosError(err) &&
  err.response?.status === 409 &&
  (err.response.data as { code?: string })?.code === 'TOKEN_ROTATED';

const TOKEN_ROTATED_RETRY_DELAY_MS = 200;

// Non-null when a refresh is in-flight; all concurrent callers await this same Promise.
let inflightRefresh: Promise<AuthPayload> | null = null;

async function executeRefresh(): Promise<AuthPayload> {
  debugLog('executing POST /auth/refresh');

  const response = await axios.post<RefreshApiResponse>(
    `${BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true, // send the httpOnly refresh-token cookie
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const { accessToken, user } = response.data.data;

  if (!user) {
    throw new Error('Refresh response did not include user data');
  }

  store.dispatch(setAccessToken(accessToken));
  saveAuthToStorage(accessToken);

  debugLog('refresh succeeded, new accessToken dispatched to store and saved to sessionStorage');

  return { accessToken, user: normalizeUser(user) };
}

// On TOKEN_ROTATED (409 grace-window race) waits TOKEN_ROTATED_RETRY_DELAY_MS then retries once; second failure propagates.
async function executeRefreshWithRetry(): Promise<AuthPayload> {
  try {
    return await executeRefresh();
  } catch (err) {
    if (isTokenRotatedError(err)) {
      debugLog(
        `TOKEN_ROTATED — waiting ${TOKEN_ROTATED_RETRY_DELAY_MS} ms then retrying once`
      );
      await delay(TOKEN_ROTATED_RETRY_DELAY_MS);
      // Second attempt: propagates naturally if it also fails
      return executeRefresh();
    }
    throw err;
  }
}

// At most one POST /auth/refresh in-flight at any time; concurrent callers share the same Promise.
export async function performRefresh(): Promise<AuthPayload> {
  if (inflightRefresh) {
    debugLog('refresh already in-flight — joining existing promise');
    return inflightRefresh;
  }

  debugLog('starting new refresh');
  inflightRefresh = executeRefreshWithRetry().finally(() => {
    inflightRefresh = null;
    debugLog('in-flight reference cleared');
  });

  return inflightRefresh;
}

// Call on logout to prevent a stale in-flight Promise from being reused after re-login.
export function resetRefreshState(): void {
  inflightRefresh = null;
  debugLog('refresh state reset (called from logout)');
}
