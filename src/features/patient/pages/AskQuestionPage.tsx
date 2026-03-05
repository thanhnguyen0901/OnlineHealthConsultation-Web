import React from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { FormikDropdown } from '@/components/form-controls/FormikDropdown';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  askQuestionRequested,
  clearQuestionSubmitted,
  loadSpecialtiesRequested,
} from '@/features/patient/redux/patient.slice';
import {
  selectPatientLoading,
  selectQuestionSubmitted,
  selectSpecialties,
} from '@/features/patient/redux/patient.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';

const questionSchema = Yup.object({
  specialtyId: Yup.string().required('Specialty is required'),
  question: Yup.string()
    .min(10, 'Question must be at least 10 characters')
    .required('Question is required'),
});

const FormikTextArea: React.FC<{ name: string; label: string; rows?: number }> = ({
  name,
  label,
  rows = 5,
}) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <InputTextarea
        {...field}
        id={name}
        rows={rows}
        className={`w-full${meta.touched && meta.error ? ' p-invalid' : ''}`}
        autoResize
      />
      {meta.touched && meta.error && (
        <small className="p-error block mt-1">{meta.error}</small>
      )}
    </div>
  );
};

export const AskQuestionPage: React.FC = () => {
  const { t, i18n } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectPatientLoading);
  const questionSubmitted = useAppSelector(selectQuestionSubmitted);
  const specialties = useAppSelector(selectSpecialties);

  React.useEffect(() => {
    dispatch(loadSpecialtiesRequested());
  }, [dispatch]);

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id as string,
  }));

  // Saga dispatches toasts; clear flag to prevent re-trigger on re-visit.
  React.useEffect(() => {
    if (questionSubmitted) {
      dispatch(clearQuestionSubmitted());
      navigate(ROUTE_PATHS.CONSULTATION_HISTORY);
    }
  }, [questionSubmitted, dispatch, navigate]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('askQuestion')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{ specialtyId: '', question: '' }}
            validationSchema={questionSchema}
            onSubmit={(values) => {
              // Do not resetForm: fires before the saga completes, losing form data on error retry.
              dispatch(askQuestionRequested({ question: values.question, specialtyId: values.specialtyId }));
            }}
          >
            {({ isSubmitting: _unused }) => (
              <Form className="space-y-5" noValidate>
                <FormikDropdown
                  name="specialtyId"
                  label={t('selectSpecialty')}
                  placeholder={t('selectSpecialty')}
                  options={specialtyOptions}
                />

                <div>
                  <label
                    htmlFor="question"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('yourQuestion')}
                  </label>
                  <FormikTextArea name="question" label="" rows={8} />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading} disabled={loading}>
                    {t('common:submit')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
