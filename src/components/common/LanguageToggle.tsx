import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

type LanguageToggleProps = {
  className?: string;
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { i18n, t } = useTranslation('common');
  const nextLanguage = i18n.language === 'vi' ? 'en' : 'vi';

  return (
    <Button
      type="button"
      size="sm"
      outlined
      className={className}
      aria-label={t('language')}
      onClick={() => i18n.changeLanguage(nextLanguage)}
    >
      {i18n.language.toUpperCase()}
    </Button>
  );
};
