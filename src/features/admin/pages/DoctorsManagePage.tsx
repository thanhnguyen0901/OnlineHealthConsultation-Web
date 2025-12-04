import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const DoctorsManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('manageDoctors')}</h1>
      <Card><p>Doctors management will be here</p></Card>
    </div>
  );
};
