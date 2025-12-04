import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';

export const InboxQuestionsPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('inbox')}</h1>
      <Card><p>Questions inbox will be here</p></Card>
    </div>
  );
};
