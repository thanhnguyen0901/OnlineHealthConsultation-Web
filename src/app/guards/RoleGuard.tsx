import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/constants/routePaths';
import type { Role } from '@/types/common';

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={ROUTE_PATHS.HOME} replace />;
  }

  return <>{children}</>;
};
