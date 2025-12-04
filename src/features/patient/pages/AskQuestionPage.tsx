import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { useField } from 'formik';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { askQuestionRequested } from '@/features/patient/redux/patient.slice';
import { selectPatientLoading } from '@/features/patient/redux/patient.selectors';

const questionSchema = Yup.object({
  question: Yup.string().min(10, 'Question must be at least 10 characters').required('Question is required'),
});

const FormikTextArea: React.FC<{ name: string; label: string; rows?: number }> = ({ name, label, rows = 5 }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <InputTextarea {...field} id={name} rows={rows} className="w-full" />
      {meta.touched && meta.error && <small className="p-error block mt-1">{meta.error}</small>}
    </div>
  );
};

export const AskQuestionPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectPatientLoading);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('askQuestion')}</h1>
      <Card>
        <Formik
          initialValues={{ question: '' }}
          validationSchema={questionSchema}
          onSubmit={(values, { resetForm }) => {
            dispatch(askQuestionRequested(values));
            resetForm();
          }}
        >
          <Form>
            <FormikTextArea name="question" label={t('yourQuestion')} rows={8} />
            <Button type="submit" loading={loading}>{t('common:submit')}</Button>
          </Form>
        </Formik>
      </Card>
    </div>
  );
};
