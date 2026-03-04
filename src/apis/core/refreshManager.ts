/**
 * Single-flight refresh manager.
 *
 * Guarantees that at any point in time there is at most ONE in-flight
 * POST /auth/refresh request, regardless of how many callers (saga bootstrap,
 * Axios 401 interceptor, etc.) invoke performRefresh() concurrently.
 *
 * All concurrent callers receive the same Promise and therefore the same
 * resolved value — preventing the duplicate-refresh race that triggers
 * TOKEN_REUSE_DETECTED on the backend.
 *
 * Design notes:
 *  - Uses a raw axios instance (NOT the shared apiClient) to avoid a
 *    circular-dependency between apiClient ↔ refreshManager, and to ensure
 *    the refresh call itself is never intercepted by the 401 handler.
 *  - Dispatches setAccessToken to the Redux store on success so the request
 *    interceptor in apiClient picks up the new token for retried requests.
 *  - Does NOT dispatch logout on failure; each call-site is responsible for
 *    its own error handling (the Axios interceptor redirects to /login; the
 *    saga dispatches meFailed).
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { store } from '@/state/store';
import { setAccessToken } from '@/features/auth/redux/auth.slice';
import type { User } from '@/types/common';

// ---------------------------------------------------------------------------
// Internal types (mirror of auth.api.ts — kept local to avoid circular imports)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL) + '/api';

/** Debug-mode logger — only active when VITE_DEBUG_REFRESH=true in .env. */
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

/** Resolves after `ms` milliseconds. */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns true when the backend responded with TOKEN_ROTATED (HTTP 409).
 *
 * TOKEN_ROTATED means the refresh token was recently rotated (within the
 * backend grace window) and the previous token was re-submitted by a
 * concurrent/racing request.  It is NOT a security alert — the caller
 * should wait briefly and retry with the same cookie (which now holds the
 * newer token set during the first successful rotation).
 */
const isTokenRotatedError = (err: unknown): boolean =>
  axios.isAxiosError(err) &&
  err.response?.status === 409 &&
  (err.response.data as { code?: string })?.code === 'TOKEN_ROTATED';

/** How long to wait before the single TOKEN_ROTATED retry (ms). */
const TOKEN_ROTATED_RETRY_DELAY_MS = 200;

// ---------------------------------------------------------------------------
// Single-flight state
// ---------------------------------------------------------------------------

/**
 * When non-null, a refresh is already in progress.
 * Every new caller awaits this same Promise instead of starting a new request.
 */
let inflightRefresh: Promise<AuthPayload> | null = null;

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Executes the actual POST /auth/refresh network call.
 * Called exactly once per refresh cycle.
 */
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
    // Should not occur with the current backend, but guard defensively.
    throw new Error('Refresh response did not include user data');
  }

  // Persist the new access token in the Redux store immediately so that the
  // Axios request interceptor attaches it to any retried requests.
  store.dispatch(setAccessToken(accessToken));

  debugLog('refresh succeeded, new accessToken dispatched to store');

  return { accessToken, user: normalizeUser(user) };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs executeRefresh(), and on TOKEN_ROTATED (409 grace-window race) waits
 * TOKEN_ROTATED_RETRY_DELAY_MS then retries **once**.
 *
 * Retry is bounded at 1: if the second attempt also fails (any error,
 * including a second TOKEN_ROTATED), the error propagates unmodified so
 * the caller can decide to logout.
 */
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

/**
 * Returns a Promise that resolves with the new AuthPayload once the refresh
 * completes.  If a refresh is already in-flight, all concurrent callers share
 * that same Promise — only one HTTP request is ever made per refresh cycle.
 */
export async function performRefresh(): Promise<AuthPayload> {
  if (inflightRefresh) {
    debugLog('refresh already in-flight — joining existing promise');
    return inflightRefresh;
  }

  debugLog('starting new refresh');
  inflightRefresh = executeRefreshWithRetry().finally(() => {
    // Clear the reference so the next refresh cycle starts fresh.
    inflightRefresh = null;
    debugLog('in-flight reference cleared');
  });

  return inflightRefresh;
}

/**
 * Resets the single-flight state immediately.
 * Call this on explicit logout so a stale in-flight promise (unlikely but
 * possible if logout races an in-progress refresh) is not accidentally
 * reused after the user logs back in.
 */
export function resetRefreshState(): void {
  inflightRefresh = null;
  debugLog('refresh state reset (called from logout)');
}
