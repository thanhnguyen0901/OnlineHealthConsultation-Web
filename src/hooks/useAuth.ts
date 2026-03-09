import { useAppSelector } from '@/state/hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsBootstrapping,
} from '@/features/auth/redux/auth.selectors';
import { ROLES } from '@/constants/roles';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBootstrapping = useAppSelector(selectIsBootstrapping);

  return {
    user,
    isAuthenticated,
    isBootstrapping,
    isPatient: user?.role === ROLES.PATIENT,
    isDoctor: user?.role === ROLES.DOCTOR,
    isAdmin: user?.role === ROLES.ADMIN,
  };
};
