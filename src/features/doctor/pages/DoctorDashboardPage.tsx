import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const DoctorDashboardPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <Card><p>Doctor dashboard content will be here</p></Card>
    </div>
  );
};
