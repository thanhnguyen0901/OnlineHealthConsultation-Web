import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loginRequested } from '@/features/auth/redux/auth.slice';
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
  selectAuthError,
} from '@/features/auth/redux/auth.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { ROLES } from '@/constants/roles';
import { useEffect } from 'react';
import { isUnauthorizedMessage } from '@/utils/authz';

const loginSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const authError = useAppSelector(selectAuthError);

  useEffect(() => {
    if (isAuthenticated && user) {
      const returnUrl =
        typeof location.state === 'object' && location.state !== null
          ? (location.state as { returnUrl?: string }).returnUrl
          : undefined;

      if (returnUrl?.startsWith('/patient') && user.role === ROLES.PATIENT) {
        navigate(returnUrl);
      } else if (returnUrl?.startsWith('/doctor') && user.role === ROLES.DOCTOR) {
        navigate(returnUrl);
      } else if (returnUrl?.startsWith('/admin') && user.role === ROLES.ADMIN) {
        navigate(returnUrl);
      } else if (user.role === ROLES.ADMIN) navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
      else if (user.role === ROLES.DOCTOR) navigate(ROUTE_PATHS.DOCTOR_DASHBOARD);
      else navigate(ROUTE_PATHS.PATIENT_DASHBOARD);
    }
  }, [isAuthenticated, user, navigate, location.state]);

  return (
    <div data-testid="login-page">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t('common:login')}
      </h2>
      {authError && (
        <div data-testid="auth-error-alert">
          <InlineAlert
            variant="error"
            title={
              isUnauthorizedMessage(authError) ? t('common:errorUnauthorized') : t('common:error')
            }
            message={authError}
            className="mb-4"
          />
        </div>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={loginSchema}
        onSubmit={(values) => {
          dispatch(loginRequested(values));
        }}
      >
        <Form className="space-y-4">
          <FormikInputText
            name="email"
            label={t('common:email')}
            type="email"
            placeholder={t('common:emailPlaceholder')}
            autoComplete="email"
            data-testid="email-input"
          />
          <FormikInputText
            name="password"
            label={t('common:password')}
            type="password"
            placeholder={t('common:passwordPlaceholder')}
            autoComplete="current-password"
            data-testid="password-input"
          />
          <div className="-mt-2 text-right">
            <Link
              to={ROUTE_PATHS.FORGOT_PASSWORD}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              data-testid="forgot-password-link"
            >
              {t('auth:forgotPasswordLink')}
            </Link>
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              data-testid="login-submit-button"
            >
              {t('common:login')}
            </Button>
          </div>
        </Form>
      </Formik>

      <div className="mt-6 text-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('auth:noAccount')} </span>
        <Link
          to={ROUTE_PATHS.REGISTER}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm hover:underline"
        >
          {t('common:register')}
        </Link>
      </div>
    </div>
  );
};
