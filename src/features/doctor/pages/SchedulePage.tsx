import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const SchedulePage: React.FC = () => {
  const { t } = useTranslation('doctor');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('schedule')}</h1>
      <Card><p>Doctor schedule will be here</p></Card>
    </div>
  );
};
