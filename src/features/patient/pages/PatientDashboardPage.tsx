import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { ROUTE_PATHS } from '@/constants/routePaths';

export const PatientDashboardPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const navigate = useNavigate();

  const quickActions = [
    { label: t('askQuestion'), icon: 'pi pi-question-circle', path: ROUTE_PATHS.ASK_QUESTION, color: 'bg-blue-500' },
    { label: t('bookAppointment'), icon: 'pi pi-calendar-plus', path: ROUTE_PATHS.BOOK_APPOINTMENT, color: 'bg-green-500' },
    { label: t('consultationHistory'), icon: 'pi pi-history', path: ROUTE_PATHS.CONSULTATION_HISTORY, color: 'bg-purple-500' },
  ];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{t('dashboard')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card 
            key={action.path} 
            className="hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-slate-900"
            onClick={() => navigate(action.path)}
          >
            <div className="flex flex-col items-center p-6">
              <div className={`${action.color} rounded-full p-6 mb-4 shadow-lg`}>
                <i className={`${action.icon} text-4xl text-white`} />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white">{action.label}</h3>
            </div>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
};
