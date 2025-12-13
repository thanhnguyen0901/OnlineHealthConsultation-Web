import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
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
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{t('askQuestion')}</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{ question: '' }}
            validationSchema={questionSchema}
            onSubmit={(values, { resetForm }) => {
              dispatch(askQuestionRequested(values));
              resetForm();
            }}
          >
            <Form className="space-y-5">
              <div>
                <label htmlFor="question" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('yourQuestion')}
                </label>
                <FormikTextArea name="question" label="" rows={8} />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading}>
                  {t('common:submit')}
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};
