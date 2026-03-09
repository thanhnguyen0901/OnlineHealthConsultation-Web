import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  registerRequested,
  clearRegisterCompleted,
} from '@/features/auth/redux/auth.slice';
import {
  selectAuthLoading,
  selectAuthError,
  selectRegisterCompleted,
} from '@/features/auth/redux/auth.selectors';
import { useToast } from '@/hooks/useToast';
import { ROUTE_PATHS } from '@/constants/routePaths';

const registerSchema = Yup.object({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const registerCompleted = useAppSelector(selectRegisterCompleted);
  const { showError } = useToast();

  React.useEffect(() => {
    if (registerCompleted) {
      dispatch(clearRegisterCompleted());
      navigate(ROUTE_PATHS.LOGIN);
    }
  }, [registerCompleted, dispatch, navigate]);

  React.useEffect(() => {
    if (authError) showError(authError);
  }, [authError, showError]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t('common:register')}
      </h2>

      <Formik
        initialValues={{ firstName: '', lastName: '', email: '', password: '' }}
        validationSchema={registerSchema}
        onSubmit={(values) => {
          // role is fixed to 'PATIENT'; admin creates DOCTOR accounts via the admin panel.
          dispatch(registerRequested({ ...values, role: 'PATIENT' }));
          // Do NOT navigate here — wait for registerCompleted flag (see useEffect above).
        }}
      >
        <Form className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormikInputText name="firstName" label={t('common:firstName')} placeholder="John" data-cy="register-first-name" />
            <FormikInputText name="lastName" label={t('common:lastName')} placeholder="Doe" data-cy="register-last-name" />
          </div>
          <FormikInputText
            name="email"
            label={t('common:email')}
            type="email"
            placeholder="you@example.com"
            data-cy="register-email"
          />
          <FormikInputText
            name="password"
            label={t('common:password')}
            type="password"
            placeholder="••••••••"
            data-cy="register-password"
          />
          <div className="pt-2">
            <Button type="submit" className="w-full" loading={loading} disabled={loading} data-cy="register-submit">
              {t('common:register')}
            </Button>
          </div>
        </Form>
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
