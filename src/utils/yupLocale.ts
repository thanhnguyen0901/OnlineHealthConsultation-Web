import * as Yup from 'yup';
import i18n from '@/i18n/initI18n';

export const setYupLocale = () => {
  Yup.setLocale({
    mixed: {
      required: () => i18n.t('validation:required'),
    },
    string: {
      email: () => i18n.t('validation:invalidEmail'),
      min: ({ min }) => i18n.t('validation:stringMin', { min }),
    },
    date: {
      // Add date validation messages if needed
    },
  });
};

// Re-run locale setup on language change
i18n.on('languageChanged', () => {
  setYupLocale();
});
