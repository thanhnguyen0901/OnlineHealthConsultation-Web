import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { extractErrorMessage } from '@/utils/errorMessage';
import * as authApi from '../apis/auth.api';

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email().required(),
});

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div data-testid="forgot-password-page">
      <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-white">
        {t('auth:forgotPasswordTitle')}
      </h2>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('auth:forgotPasswordSubtitle')}
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

      <Formik
        initialValues={{ email: '' }}
        validationSchema={forgotPasswordSchema}
        onSubmit={async (values) => {
          setLoading(true);
          setSuccess(null);
          setError(null);
          try {
            const message = await authApi.forgotPassword(values.email);
            setSuccess(message || t('auth:forgotPasswordSuccess'));
          } catch (submitError) {
            setError(extractErrorMessage(submitError, t('common:unexpectedError')));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Form className="space-y-4">
          <FormikInputText
            name="email"
            label={t('common:email')}
            type="email"
            placeholder={t('common:emailPlaceholder')}
            autoComplete="email"
            data-testid="forgot-email-input"
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
            data-testid="forgot-password-submit-button"
          >
            {t('auth:sendResetLink')}
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
