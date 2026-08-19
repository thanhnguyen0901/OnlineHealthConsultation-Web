import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { extractErrorMessage } from '@/utils/errorMessage';
import * as authApi from '../apis/auth.api';

const resetPasswordSchema = Yup.object({
  token: Yup.string().required(),
  newPassword: Yup.string().min(6).required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')])
    .required(),
});

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const initialToken = searchParams.get('token') ?? '';

  return (
    <div data-testid="reset-password-page">
      <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-white">
        {t('auth:resetPasswordTitle')}
      </h2>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('auth:resetPasswordSubtitle')}
      </p>

      {success && (
        <InlineAlert
          variant="success"
          title={t('common:success')}
          message={success}
          className="mb-4"
        />
      )}
      {error && (
        <InlineAlert
          variant="error"
          title={t('common:error')}
          message={error}
          className="mb-4"
        />
      )}

      {!initialToken && (
        <InlineAlert
          variant="warning"
          title={t('auth:resetTokenMissingTitle')}
          message={t('auth:resetTokenMissingMessage')}
          className="mb-4"
        />
      )}

      <Formik
        initialValues={{
          token: initialToken,
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={resetPasswordSchema}
        enableReinitialize
        onSubmit={async (values) => {
          setLoading(true);
          setSuccess(null);
          setError(null);
          try {
            const message = await authApi.resetPassword({
              token: values.token,
              newPassword: values.newPassword,
            });
            setSuccess(message || t('auth:resetPasswordSuccess'));
            window.setTimeout(() => navigate(ROUTE_PATHS.LOGIN), 900);
          } catch (submitError) {
            setError(extractErrorMessage(submitError, t('common:unexpectedError')));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Form className="space-y-4">
          {!initialToken && (
            <FormikInputText
              name="token"
              label={t('auth:resetToken')}
              placeholder={t('auth:resetTokenPlaceholder')}
              autoComplete="off"
              data-testid="reset-token-input"
            />
          )}
          <FormikInputText
            name="newPassword"
            label={t('auth:newPassword')}
            type="password"
            placeholder={t('common:passwordPlaceholder')}
            autoComplete="new-password"
            data-testid="new-password-input"
          />
          <FormikInputText
            name="confirmPassword"
            label={t('auth:confirmPassword')}
            type="password"
            placeholder={t('common:passwordPlaceholder')}
            autoComplete="new-password"
            data-testid="confirm-password-input"
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
            data-testid="reset-password-submit-button"
          >
            {t('auth:resetPasswordSubmit')}
          </Button>
        </Form>
      </Formik>

      <div className="mt-6 text-center">
        <Link
          to={ROUTE_PATHS.LOGIN}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('auth:backToLogin')}
        </Link>
      </div>
    </div>
  );
};
