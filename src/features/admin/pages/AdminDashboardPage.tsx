import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title={t('totalUsers')}><p className="text-3xl font-bold">0</p></Card>
        <Card title={t('totalDoctors')}><p className="text-3xl font-bold">0</p></Card>
        <Card title={t('totalAppointments')}><p className="text-3xl font-bold">0</p></Card>
      </div>
    </div>
  );
};
