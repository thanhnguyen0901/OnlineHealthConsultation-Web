import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AuthLayout: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <i className="pi pi-heart-fill text-3xl text-blue-600 dark:text-blue-400"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth:title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('auth:tagline')}</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
