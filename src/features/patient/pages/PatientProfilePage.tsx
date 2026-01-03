import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { FormikDropdown } from '@/components/form-controls/FormikDropdown';
import { FormikCalendar } from '@/components/form-controls/FormikCalendar';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadProfileRequested,
  updateProfileRequested,
} from '@/features/patient/redux/patient.slice';
import { selectProfile, selectPatientLoading } from '@/features/patient/redux/patient.selectors';
import type { PatientProfile } from '@/features/patient/types';

const profileSchema = Yup.object({
  fullName: Yup.string().required(),
  dateOfBirth: Yup.date().nullable(),
  gender: Yup.string().oneOf(['male', 'female', 'other']),
  phone: Yup.string().matches(/^[0-9]{10,11}$/),
  address: Yup.string(),
  medicalHistory: Yup.string(),
  allergies: Yup.string(),
  chronicDiseases: Yup.string(),
});

export const PatientProfilePage: React.FC = () => {
  const { t } = useTranslation(['patient', 'common']);
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectPatientLoading);

  useEffect(() => {
    dispatch(loadProfileRequested());
  }, [dispatch]);

  const genderOptions = [
    { label: t('patient:male'), value: 'male' },
    { label: t('patient:female'), value: 'female' },
    { label: t('patient:other'), value: 'other' },
  ];

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('patient:profile')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{
              fullName: profile?.fullName || '',
              dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null,
              gender: profile?.gender || '',
              phone: profile?.phone || '',
              address: profile?.address || '',
              medicalHistory: profile?.medicalHistory || '',
              allergies: profile?.allergies || '',
              chronicDiseases: profile?.chronicDiseases || '',
            }}
            validationSchema={profileSchema}
            enableReinitialize
            onSubmit={(values) => {
              const profileData: Partial<PatientProfile> = {
                fullName: values.fullName,
                dateOfBirth: values.dateOfBirth
                  ? values.dateOfBirth.toISOString().split('T')[0]
                  : undefined,
                gender: values.gender as 'male' | 'female' | 'other',
                phone: values.phone,
                address: values.address,
                medicalHistory: values.medicalHistory,
                allergies: values.allergies,
                chronicDiseases: values.chronicDiseases,
              };
              dispatch(updateProfileRequested(profileData));
            }}
          >
            <Form className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  {t('patient:personalInformation')}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormikInputText
                      name="fullName"
                      label={t('patient:fullName')}
                      placeholder={t('patient:fullNamePlaceholder')}
                    />
                    <FormikInputText
                      name="phone"
                      label={t('patient:phone')}
                      placeholder={t('patient:phonePlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormikCalendar
                      name="dateOfBirth"
                      label={t('patient:dateOfBirth')}
                      placeholder={t('patient:selectDate')}
                    />
                    <FormikDropdown
                      name="gender"
                      label={t('patient:gender')}
                      options={genderOptions}
                      placeholder={t('patient:selectGender')}
                    />
                  </div>

                  <FormikInputText
                    name="address"
                    label={t('patient:address')}
                    placeholder={t('patient:addressPlaceholder')}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  {t('patient:medicalInformation')}
                </h3>

                <div className="space-y-4">
                  <FormikInputText
                    name="medicalHistory"
                    label={t('patient:medicalHistory')}
                    placeholder={t('patient:medicalHistoryPlaceholder')}
                    as="textarea"
                    rows={3}
                  />

                  <FormikInputText
                    name="allergies"
                    label={t('patient:allergies')}
                    placeholder={t('patient:allergiesPlaceholder')}
                    as="textarea"
                    rows={2}
                  />

                  <FormikInputText
                    name="chronicDiseases"
                    label={t('patient:chronicDiseases')}
                    placeholder={t('patient:chronicDiseasesPlaceholder')}
                    as="textarea"
                    rows={2}
                  />
                </div>
              </section>

              <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" loading={loading}>
                  {t('common:save')}
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};
