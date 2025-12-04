import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikInputText } from '@/components/form-controls/FormikInputText';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { registerRequested } from '@/features/auth/redux/auth.slice';
import { selectAuthLoading } from '@/features/auth/redux/auth.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';

const registerSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t('common:register')}
      </h2>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={registerSchema}
        onSubmit={(values) => {
          dispatch(registerRequested(values));
          navigate(ROUTE_PATHS.LOGIN);
        }}
      >
        <Form className="space-y-4">
          <FormikInputText 
            name="name" 
            label={t('common:name')} 
            placeholder="John Doe" 
          />
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
            {t('common:register')}
          </Button>
        </Form>
      </Formik>
      <div className="mt-6 text-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          Already have an account?{' '}
        </span>
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
