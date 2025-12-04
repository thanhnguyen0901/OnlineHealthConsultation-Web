import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const BookAppointmentPage: React.FC = () => {
  const { t } = useTranslation('patient');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('bookAppointment')}</h1>
      <Card><p>Appointment booking form will be here</p></Card>
    </div>
  );
};
