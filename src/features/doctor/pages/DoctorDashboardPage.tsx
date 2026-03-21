import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadProfileRequested } from '../redux/doctor.slice';
import {
  selectDoctorProfile,
  selectDoctorLoading,
  selectDoctorError,
} from '../redux/doctor.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { InlineAlert } from '@/components/common/InlineAlert';
import { isUnauthorizedMessage } from '@/utils/authz';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 flex items-center gap-4">
    <div className={`rounded-full p-3 ${color}`}>
      <i className={`${icon} text-2xl text-white`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

interface QuickLinkProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 flex items-start gap-4 text-left w-full hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-700 transition-all"
  >
    <i className={`${icon} text-2xl text-blue-500 mt-0.5`} />
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <i className="pi pi-chevron-right text-gray-400 ml-auto mt-1" />
  </button>
);

export const DoctorDashboardPage: React.FC = () => {
  const { t } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(selectDoctorProfile);
  const loading = useAppSelector(selectDoctorLoading);
  const error = useAppSelector(selectDoctorError);

  useEffect(() => {
    dispatch(loadProfileRequested());
  }, [dispatch]);

  const stats = profile?.stats;
  const ratingAvg = stats?.ratingAverage ? stats.ratingAverage.toFixed(1) : '—';

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('dashboard')}
          </h1>
          {profile && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('welcomeBack')},{' '}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {profile.firstName} {profile.lastName}
              </span>
            </p>
          )}
        </div>
        {error && (
          <InlineAlert
            variant="error"
            title={
              isUnauthorizedMessage(error)
                ? t('common:errorUnauthorized')
                : t('common:error')
            }
            message={error}
            onRetry={() => dispatch(loadProfileRequested())}
          />
        )}

        {loading && !profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="pi pi-inbox"
              label={t('totalQuestions')}
              value={stats?.questionCount ?? '—'}
              color="bg-blue-500"
            />
            <StatCard
              icon="pi pi-calendar"
              label={t('totalAppointments')}
              value={stats?.appointmentCount ?? '—'}
              color="bg-indigo-500"
            />
            <StatCard
              icon="pi pi-star"
              label={t('averageRating')}
              value={ratingAvg}
              color="bg-yellow-500"
            />
            <StatCard
              icon="pi pi-users"
              label={t('totalRatings')}
              value={stats?.ratingCount ?? '—'}
              color="bg-green-500"
            />
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('quickLinks')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLink
              icon="pi pi-inbox"
              label={t('inbox')}
              description={t('viewIncomingQuestions')}
              onClick={() => navigate(ROUTE_PATHS.INBOX_QUESTIONS)}
            />
            <QuickLink
              icon="pi pi-users"
              label={t('patientsList')}
              description={t('viewPatientsList')}
              onClick={() => navigate(ROUTE_PATHS.DOCTOR_PATIENTS)}
            />
            <QuickLink
              icon="pi pi-calendar-times"
              label={t('appointments')}
              description={t('manageAppointments')}
              onClick={() => navigate(ROUTE_PATHS.DOCTOR_APPOINTMENTS)}
            />
            <QuickLink
              icon="pi pi-clock"
              label={t('schedule')}
              description={t('viewSchedule')}
              onClick={() => navigate(ROUTE_PATHS.SCHEDULE)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
