import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/state/hooks';
import { selectAuthLoading } from '@/features/auth/redux/auth.selectors';
import { Spinner } from '@/components/common/Spinner';
import { ROUTE_PATHS } from '@/constants/routePaths';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const loading = useAppSelector(selectAuthLoading);

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  return <>{children}</>;
};
