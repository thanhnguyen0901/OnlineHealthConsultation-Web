import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { Spinner } from '@/components/common/Spinner';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadProfileRequested } from '@/features/patient/redux/patient.slice';
import {
  selectProfile,
  selectPatientLoading,
  selectPatientError,
} from '@/features/patient/redux/patient.selectors';
import { isUnauthorizedMessage } from '@/utils/authz';

export const PatientDashboardPage: React.FC = () => {
  const { t } = useTranslation(['patient', 'common']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectPatientLoading);
  const error = useAppSelector(selectPatientError);

  React.useEffect(() => {
    dispatch(loadProfileRequested());
  }, [dispatch]);

  const quickActions = [
    {
      label: t('askQuestion'),
      icon: 'pi pi-question-circle',
      path: ROUTE_PATHS.ASK_QUESTION,
      color: 'bg-blue-500',
      testId: 'quick-action-ask-question',
    },
    {
      label: t('bookAppointment'),
      icon: 'pi pi-calendar-plus',
      path: ROUTE_PATHS.BOOK_APPOINTMENT,
      color: 'bg-green-500',
      testId: 'quick-action-book-appointment',
    },
    {
      label: t('consultationHistory'),
      icon: 'pi pi-history',
      path: ROUTE_PATHS.CONSULTATION_HISTORY,
      color: 'bg-purple-500',
      testId: 'quick-action-history',
    },
  ];

  if (loading && !profile) {
    return (
      <div data-testid="loading-state" className="flex items-center justify-center min-h-[320px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="patient-dashboard-page" className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        {profile && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('common:welcome')},{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {profile.firstName} {profile.lastName}
            </span>
          </p>
        )}
        {error && (
          <div data-testid="error-alert">
            <InlineAlert
              variant="error"
              title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
              message={error}
              onRetry={() => dispatch(loadProfileRequested())}
              className="mb-4"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-slate-900"
              onClick={() => navigate(action.path)}
              data-testid={action.testId}
            >
              <div className="flex flex-col items-center p-6">
                <div className={`${action.color} rounded-full p-6 mb-4 shadow-lg`}>
                  <i className={`${action.icon} text-4xl text-white`} />
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                  {action.label}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
