import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';

const dashboardForRole = (role?: string) => {
  if (role === ROLES.ADMIN) return ROUTE_PATHS.ADMIN_DASHBOARD;
  if (role === ROLES.DOCTOR) return ROUTE_PATHS.DOCTOR_DASHBOARD;
  if (role === ROLES.PATIENT) return ROUTE_PATHS.PATIENT_DASHBOARD;
  return ROUTE_PATHS.HOME;
};

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main
      data-testid="forbidden-page"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-gray-900"
    >
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <i className="pi pi-lock text-3xl" />
        </div>
        <h1 className="text-4xl font-bold text-gray-950 dark:text-white">403</h1>
        <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
          {t('accessForbidden')}
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t('accessForbiddenDescription')}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => navigate(dashboardForRole(user?.role))}>{t('goToDashboard')}</Button>
          <Button outlined onClick={() => navigate(ROUTE_PATHS.HOME)}>
            {t('homeLabel')}
          </Button>
        </div>
      </div>
    </main>
  );
};
