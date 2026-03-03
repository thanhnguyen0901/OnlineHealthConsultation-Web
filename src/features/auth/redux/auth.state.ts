import type { User } from '@/types/common';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  /** Set to true when registration API call succeeds; cleared by clearRegisterCompleted. */
  registerCompleted: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isBootstrapping: true,
  registerCompleted: false,
};
