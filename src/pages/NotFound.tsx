import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '@/constants/routePaths';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('pageNotFound')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('notFoundDescription')}</p>
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
};
