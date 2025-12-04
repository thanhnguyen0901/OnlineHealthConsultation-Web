import { useAppSelector } from '@/state/hooks';
import { selectUser, selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    isPatient: user?.role === 'PATIENT',
    isDoctor: user?.role === 'DOCTOR',
    isAdmin: user?.role === 'ADMIN',
  };
};
