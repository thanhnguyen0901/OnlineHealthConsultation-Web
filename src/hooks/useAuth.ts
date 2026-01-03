import { useAppSelector } from '@/state/hooks';
import { selectUser, selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';
import { ROLES } from '@/constants/roles';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    isPatient: user?.role === ROLES.PATIENT,
    isDoctor: user?.role === ROLES.DOCTOR,
    isAdmin: user?.role === ROLES.ADMIN,
  };
};
