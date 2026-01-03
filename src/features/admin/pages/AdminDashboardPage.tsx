import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Spinner } from '@/components/common/Spinner';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadStatsRequested } from '../redux/admin.slice';
import { selectAdminStats, selectAdminLoading } from '../redux/admin.selectors';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAdminStats);
  const loading = useAppSelector(selectAdminLoading);

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
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-users text-5xl mb-3 opacity-90"></i>
              <p className="text-blue-100 mb-2 text-sm font-medium">{t('totalUsers')}</p>
              <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-user-plus text-5xl mb-3 opacity-90"></i>
              <p className="text-green-100 mb-2 text-sm font-medium">{t('totalDoctors')}</p>
              <p className="text-4xl font-bold">{stats?.totalDoctors || 0}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-calendar text-5xl mb-3 opacity-90"></i>
              <p className="text-purple-100 mb-2 text-sm font-medium">{t('totalAppointments')}</p>
              <p className="text-4xl font-bold">{stats?.totalAppointments || 0}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <div className="text-center p-4">
              <i className="pi pi-question-circle text-5xl mb-3 opacity-90"></i>
              <p className="text-orange-100 mb-2 text-sm font-medium">{t('totalQuestions')}</p>
              <p className="text-4xl font-bold">{stats?.totalQuestions || 0}</p>
            </div>
          </Card>
        </div>

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
            <div className="text-center py-8">
              <i className="pi pi-inbox text-5xl text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{t('noRecentActivity')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
