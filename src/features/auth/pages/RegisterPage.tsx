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
import { getSpecialties } from '@/features/admin/apis/admin.api';
import type { Specialty } from '@/features/admin/types';

const registerSchema = Yup.object({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  role: Yup.string().oneOf(['PATIENT', 'DOCTOR']).required(),
  specialty: Yup.string().when('role', {
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
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);

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
    getSpecialties().then(setSpecialties).catch(() => setSpecialties([]));
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
    <div>
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
        <InlineAlert
          variant="error"
          title={t('common:error')}
          message={authError}
          className="mb-4"
        />
      )}

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'PATIENT',
          specialty: '',
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
              specialty:
                values.role === 'DOCTOR' ? (values.specialty || undefined) : undefined,
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
              data-cy="register-first-name"
            />
            <FormikInputText
              name="lastName"
              label={t('common:lastName')}
              placeholder={t('auth:lastNamePlaceholder')}
              data-cy="register-last-name"
            />
          </div>
          <FormikInputText
            name="email"
            label={t('common:email')}
            type="email"
            placeholder={t('common:emailPlaceholder')}
            data-cy="register-email"
          />
          <FormikInputText
            name="password"
            label={t('common:password')}
            type="password"
            placeholder={t('common:passwordPlaceholder')}
            data-cy="register-password"
          />
          <FormikDropdown
            name="role"
            label={t('auth:registerAs')}
            options={roleOptions}
            placeholder={t('auth:registerAs')}
          />
          {values.role === 'DOCTOR' && (
            <FormikDropdown
              name="specialty"
              label={t('doctor:specialty')}
              options={specialtyOptions}
              placeholder={t('doctor:selectSpecialty')}
            />
          )}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
              data-cy="register-submit"
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
