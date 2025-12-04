import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loginRequested } from '@/features/auth/redux/auth.slice';
import { selectAuthLoading, selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { useEffect } from 'react';

const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTE_PATHS.PATIENT_DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t('common:login')}
      </h2>
      <Formik
        initialValues={{ email: '', password: '' }}
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
            placeholder="you@example.com" 
          />
          <FormikInputText 
            name="password" 
            label={t('common:password')} 
            type="password" 
            placeholder="••••••••" 
          />
          <Button type="submit" className="w-full mt-6" loading={loading}>
            {t('common:login')}
          </Button>
        </Form>
      </Formik>
      <div className="mt-6 text-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          Don't have an account?{' '}
        </span>
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
