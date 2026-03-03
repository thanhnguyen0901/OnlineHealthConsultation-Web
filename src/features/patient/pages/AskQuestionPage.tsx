import React from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  askQuestionRequested,
  clearQuestionSubmitted,
} from '@/features/patient/redux/patient.slice';
import {
  selectPatientLoading,
  selectPatientError,
  selectQuestionSubmitted,
} from '@/features/patient/redux/patient.selectors';
import { useToast } from '@/hooks/useToast';
import { ROUTE_PATHS } from '@/constants/routePaths';

const questionSchema = Yup.object({
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
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectPatientLoading);
  const patientError = useAppSelector(selectPatientError);
  const questionSubmitted = useAppSelector(selectQuestionSubmitted);
  const { showError } = useToast();

  // On success: navigate to history. The success toast is already fired by
  // patient.saga.ts → handleAskQuestion. Clear the flag so it doesn't fire
  // again if the user navigates back.
  React.useEffect(() => {
    if (questionSubmitted) {
      dispatch(clearQuestionSubmitted());
      navigate(ROUTE_PATHS.CONSULTATION_HISTORY);
    }
  }, [questionSubmitted, dispatch, navigate]);

  // Show backend error as toast; the form stays open so the user can retry.
  React.useEffect(() => {
    if (patientError) showError(patientError);
  }, [patientError, showError]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('askQuestion')}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{ question: '' }}
            validationSchema={questionSchema}
            onSubmit={(values) => {
              // Do NOT resetForm here — it fires before the saga completes.
              // On success the page navigates away; on error the form stays
              // populated so the user can correct and retry.
              dispatch(askQuestionRequested(values));
            }}
          >
            {({ isSubmitting: _unused }) => (
              <Form className="space-y-5" noValidate>
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
                  {/* loading from Redux — true while the saga is running */}
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
