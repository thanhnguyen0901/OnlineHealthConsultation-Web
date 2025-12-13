import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const DoctorDashboardPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{t('dashboard')}</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <div className="p-6 text-center">
            <i className="pi pi-chart-line text-6xl text-blue-500 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">{t('dashboardContent')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
