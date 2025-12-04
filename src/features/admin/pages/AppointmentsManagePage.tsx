import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const AppointmentsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('manageAppointments')}</h1>
      <Card><p>Appointments management will be here</p></Card>
    </div>
  );
};
