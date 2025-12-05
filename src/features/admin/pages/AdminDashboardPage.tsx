import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Spinner } from '@/components/common/Spinner';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadStatsRequested } from '../redux/admin.slice';
import { selectAdminStats, selectAdminLoading } from '../redux/admin.selectors';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation('admin');
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
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-md">
          <div className="text-center">
            <i className="pi pi-users text-blue-500 text-4xl mb-2"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{t('totalUsers')}</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <i className="pi pi-user-plus text-green-500 text-4xl mb-2"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{t('totalDoctors')}</p>
            <p className="text-3xl font-bold text-green-600">{stats?.totalDoctors || 0}</p>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <i className="pi pi-calendar text-purple-500 text-4xl mb-2"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{t('totalAppointments')}</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalAppointments || 0}</p>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <i className="pi pi-question-circle text-orange-500 text-4xl mb-2"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{t('totalQuestions')}</p>
            <p className="text-3xl font-bold text-orange-600">{stats?.totalQuestions || 0}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title={t('quickActions')} className="lg:col-span-1">
          <div className="space-y-2">
            <button
              onClick={() => (window.location.href = '/admin/users')}
              className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
            >
              <i className="pi pi-users mr-3 text-blue-500"></i>
              {t('manageUsers')}
            </button>
            <button
              onClick={() => (window.location.href = '/admin/doctors')}
              className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
            >
              <i className="pi pi-user-plus mr-3 text-green-500"></i>
              {t('manageDoctors')}
            </button>
            <button
              onClick={() => (window.location.href = '/admin/appointments')}
              className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
            >
              <i className="pi pi-calendar mr-3 text-purple-500"></i>
              {t('manageAppointments')}
            </button>
            <button
              onClick={() => (window.location.href = '/admin/specialties')}
              className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
            >
              <i className="pi pi-tags mr-3 text-teal-500"></i>
              {t('manageSpecialties')}
            </button>
          </div>
        </Card>
        
        <Card title={t('recentActivity')} className="lg:col-span-2">
          <p className="text-gray-600 dark:text-gray-400">{t('noRecentActivity')}</p>
        </Card>
      </div>
    </div>
  );
};
