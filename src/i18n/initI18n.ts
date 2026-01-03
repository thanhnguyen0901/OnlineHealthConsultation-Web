import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '@/utils/storage';
import commonEN from './en/common.json';
import patientEN from './en/patient.json';
import doctorEN from './en/doctor.json';
import adminEN from './en/admin.json';
import authEN from './en/auth.json';
import validationEN from './en/validation.json';
import commonVI from './vi/common.json';
import patientVI from './vi/patient.json';
import doctorVI from './vi/doctor.json';
import adminVI from './vi/admin.json';
import authVI from './vi/auth.json';
import validationVI from './vi/validation.json';

// Get saved locale or default to 'en'
const savedLocale = storage.get<string>('locale') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      patient: patientEN,
      doctor: doctorEN,
      admin: adminEN,
      auth: authEN,
      validation: validationEN,
    },
    vi: {
      common: commonVI,
      patient: patientVI,
      doctor: doctorVI,
      admin: adminVI,
      auth: authVI,
      validation: validationVI,
    },
  },
  lng: savedLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

// Persist locale changes
i18n.on('languageChanged', (lng) => {
  storage.set('locale', lng);
  document.documentElement.lang = lng;
});

export default i18n;
