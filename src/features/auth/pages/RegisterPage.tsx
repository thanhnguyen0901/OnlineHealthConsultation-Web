import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { FormikDropdown } from '@/components/form-controls/FormikDropdown';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { registerRequested, clearRegisterCompleted } from '@/features/auth/redux/auth.slice';
import {
  selectAuthLoading,
  selectAuthError,
  selectRegisterCompleted,
} from '@/features/auth/redux/auth.selectors';
import { useToast } from '@/hooks/useToast';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { getPublicSpecialties } from '@/features/public/apis/public.api';
import type { PublicSpecialty } from '@/features/public/types';

const registerSchema = Yup.object({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  role: Yup.string().oneOf(['PATIENT', 'DOCTOR']).required(),
  specialtyId: Yup.string().when('role', {
    is: 'DOCTOR',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional(),
  }),
});

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const registerCompleted = useAppSelector(selectRegisterCompleted);
  const { showError } = useToast();
  const [submittedRole, setSubmittedRole] = React.useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [specialties, setSpecialties] = React.useState<PublicSpecialty[]>([]);

  React.useEffect(() => {
    if (registerCompleted) {
      const timer = setTimeout(() => {
        dispatch(clearRegisterCompleted());
        navigate(ROUTE_PATHS.LOGIN);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [registerCompleted, dispatch, navigate]);

  React.useEffect(() => {
    if (authError) showError(authError);
  }, [authError, showError]);

  React.useEffect(() => {
    getPublicSpecialties()
      .then(setSpecialties)
      .catch(() => setSpecialties([]));
  }, []);

  const roleOptions = [
    { label: t('auth:registerRolePatient'), value: 'PATIENT' },
    { label: t('auth:registerRoleDoctor'), value: 'DOCTOR' },
  ];

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id,
  }));

  return (
    <div data-testid="register-page">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t('common:register')}
      </h2>
      {registerCompleted && (
        <InlineAlert
          variant="success"
          title={t('common:success')}
          message={
            submittedRole === 'DOCTOR'
              ? t('auth:registerDoctorPendingApproval')
              : t('auth:registerSuccess')
          }
          className="mb-4"
        />
      )}
      {authError && (
        <div data-testid="auth-error-alert">
          <InlineAlert
            variant="error"
            title={t('common:error')}
            message={authError}
            className="mb-4"
          />
        </div>
      )}

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'PATIENT',
          specialtyId: '',
        }}
        validationSchema={registerSchema}
        onSubmit={(values) => {
          setSubmittedRole(values.role as 'PATIENT' | 'DOCTOR');
          dispatch(
            registerRequested({
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              password: values.password,
              role: values.role as 'PATIENT' | 'DOCTOR',
              specialtyId: values.role === 'DOCTOR' ? values.specialtyId || undefined : undefined,
            })
          );
          // Do NOT navigate here — wait for registerCompleted flag (see useEffect above).
        }}
      >
        {({ values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormikInputText
                name="firstName"
                label={t('common:firstName')}
                placeholder={t('auth:firstNamePlaceholder')}
                data-testid="register-first-name"
              />
              <FormikInputText
                name="lastName"
                label={t('common:lastName')}
                placeholder={t('auth:lastNamePlaceholder')}
                data-testid="register-last-name"
              />
            </div>
            <FormikInputText
              name="email"
              label={t('common:email')}
              type="email"
              placeholder={t('common:emailPlaceholder')}
              data-testid="email-input"
            />
            <FormikInputText
              name="password"
              label={t('common:password')}
              type="password"
              placeholder={t('common:passwordPlaceholder')}
              data-testid="password-input"
            />
            <FormikDropdown
              name="role"
              label={t('auth:registerAs')}
              options={roleOptions}
              placeholder={t('auth:registerAs')}
              data-testid="register-role"
            />
            {values.role === 'DOCTOR' && (
              <FormikDropdown
                name="specialtyId"
                label={t('doctor:specialty')}
                options={specialtyOptions}
                placeholder={t('doctor:selectSpecialty')}
                data-testid="register-specialty"
              />
            )}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
                data-testid="register-submit-button"
              >
                {t('common:register')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('auth:haveAccount')} </span>
        <Link
          to={ROUTE_PATHS.LOGIN}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm hover:underline"
        >
          {t('common:login')}
        </Link>
      </div>
    </div>
  );
};
