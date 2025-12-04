import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const UsersManagePage: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('manageUsers')}</h1>
      <Card><p>Users management will be here</p></Card>
    </div>
  );
};
