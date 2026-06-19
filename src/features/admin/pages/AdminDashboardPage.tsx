import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Spinner } from '@/components/common/Spinner';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadStatsRequested } from '../redux/admin.slice';
import { selectAdminStats, selectAdminLoading, selectAdminError } from '../redux/admin.selectors';
import { isUnauthorizedMessage } from '@/utils/authz';

type StatCardProps = {
  icon: string;
  label: string;
  value: number | undefined;
  gradient: string;
  textMuted: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient, textMuted }) => (
  <Card className={`${gradient} text-white shadow-lg`} data-testid="admin-dashboard-card">
    <div className="text-center p-4">
      <i className={`${icon} text-4xl mb-3 opacity-90`}></i>
      <p className={`${textMuted} mb-1 text-xs font-medium uppercase tracking-wide`}>{label}</p>
      <p className="text-3xl font-bold">{value ?? <span className="opacity-50">—</span>}</p>
    </div>
  </Card>
);

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAdminStats);
  const loading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);

  useEffect(() => {
    dispatch(loadStatsRequested());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8" data-testid="admin-dashboard-page">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadStatsRequested())}
            className="mb-4"
          />
        )}

        {/* ── Section 1: Users & Resources ───────────────────────────── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          {t('statsUsers')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="pi pi-users"
            label={t('totalUsers')}
            value={stats?.totalUsers}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            textMuted="text-blue-100"
          />
          <StatCard
            icon="pi pi-user-plus"
            label={t('totalDoctors')}
            value={stats?.totalDoctors}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            textMuted="text-green-100"
          />
          <StatCard
            icon="pi pi-heart"
            label={t('totalPatients')}
            value={stats?.totalPatients}
            gradient="bg-gradient-to-br from-teal-500 to-teal-600"
            textMuted="text-teal-100"
          />
          <StatCard
            icon="pi pi-tags"
            label={t('totalSpecialties')}
            value={stats?.totalSpecialties}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            textMuted="text-indigo-100"
          />
        </div>

        {/* ── Section 1b: Active Users ──────────────────────────────── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          {t('statsActiveUsers')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon="pi pi-bolt"
            label={t('totalActiveUsers')}
            value={stats?.totalActiveUsers}
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
            textMuted="text-cyan-100"
          />
          <StatCard
            icon="pi pi-heart"
            label={t('activePatients')}
            value={stats?.activePatients}
            gradient="bg-gradient-to-br from-sky-500 to-sky-600"
            textMuted="text-sky-100"
          />
          <StatCard
            icon="pi pi-user-plus"
            label={t('activeDoctors')}
            value={stats?.activeDoctors}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
            textMuted="text-violet-100"
          />
        </div>

        {/* ── Section 2: Appointments ─────────────────────────────────── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          {t('statsAppointments')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon="pi pi-calendar"
            label={t('totalAppointments')}
            value={stats?.totalAppointments}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            textMuted="text-purple-100"
          />
          <StatCard
            icon="pi pi-clock"
            label={t('pendingAppointments')}
            value={stats?.pendingAppointments}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
            textMuted="text-amber-100"
          />
          <StatCard
            icon="pi pi-check-circle"
            label={t('completedAppointments')}
            value={stats?.completedAppointments}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            textMuted="text-emerald-100"
          />
        </div>

        {/* ── Section 3: Consultations ────────────────────────────────── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          {t('statsConsultations')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="pi pi-question-circle"
            label={t('totalQuestions')}
            value={stats?.totalQuestions}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
            textMuted="text-orange-100"
          />
          <StatCard
            icon="pi pi-comment"
            label={t('answeredQuestions')}
            value={stats?.answeredQuestions}
            gradient="bg-gradient-to-br from-lime-500 to-lime-600"
            textMuted="text-lime-100"
          />
          <StatCard
            icon="pi pi-hourglass"
            label={t('pendingQuestions')}
            value={stats?.pendingQuestions}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
            textMuted="text-rose-100"
          />
          <StatCard
            icon="pi pi-star"
            label={t('totalRatings')}
            value={stats?.totalRatings}
            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
            textMuted="text-pink-100"
          />
        </div>

        {/* ── Bottom row: Quick Actions + Recent Activity ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
              {t('quickActions')}
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center transition group"
              >
                <i className="pi pi-users mr-3 text-blue-500 text-xl"></i>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {t('manageUsers')}
                </span>
              </button>
              <button
                onClick={() => navigate('/admin/doctors')}
                className="w-full p-3 text-left hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg flex items-center transition group"
              >
                <i className="pi pi-user-plus mr-3 text-green-500 text-xl"></i>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                  {t('manageDoctors')}
                </span>
              </button>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="w-full p-3 text-left hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg flex items-center transition group"
              >
                <i className="pi pi-calendar mr-3 text-purple-500 text-xl"></i>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {t('manageAppointments')}
                </span>
              </button>
              <button
                onClick={() => navigate('/admin/specialties')}
                className="w-full p-3 text-left hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg flex items-center transition group"
              >
                <i className="pi pi-tags mr-3 text-teal-500 text-xl"></i>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {t('manageSpecialties')}
                </span>
              </button>
            </div>
          </Card>

          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
              {t('recentActivity')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('pendingAppointments')}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {stats?.pendingAppointments ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('pendingQuestions')}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {stats?.pendingQuestions ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('totalRatings')}
                </span>
                <span className="font-semibold text-pink-600 dark:text-pink-400">
                  {stats?.totalRatings ?? 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
