import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEN from './en/common.json';
import patientEN from './en/patient.json';
import doctorEN from './en/doctor.json';
import adminEN from './en/admin.json';
import commonVI from './vi/common.json';
import patientVI from './vi/patient.json';
import doctorVI from './vi/doctor.json';
import adminVI from './vi/admin.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      patient: patientEN,
      doctor: doctorEN,
      admin: adminEN,
    },
    vi: {
      common: commonVI,
      patient: patientVI,
      doctor: doctorVI,
      admin: adminVI,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
