import React from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
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
  selectPatientError,
} from '@/features/patient/redux/patient.selectors';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { isUnauthorizedMessage } from '@/utils/authz';

const FormikTextArea: React.FC<{
  name: string;
  label: string;
  rows?: number;
  'data-cy'?: string;
}> = ({ name, label, rows = 5, 'data-cy': dataCy }) => {
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
        data-cy={dataCy}
      />
      {meta.touched && meta.error && <small className="p-error block mt-1">{meta.error}</small>}
    </div>
  );
};

export const AskQuestionPage: React.FC = () => {
  const { t, i18n } = useTranslation(['patient', 'validation']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectPatientLoading);
  const questionSubmitted = useAppSelector(selectQuestionSubmitted);
  const specialties = useAppSelector(selectSpecialties);
  const error = useAppSelector(selectPatientError);

  const questionSchema = React.useMemo(
    () =>
      Yup.object({
        specialtyId: Yup.string().required(t('validation:specialtyRequired')),
        question: Yup.string()
          .min(10, t('validation:questionMin', { min: 10 }))
          .required(t('validation:questionRequired')),
      }),
    [t]
  );

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
      const timer = setTimeout(() => {
        dispatch(clearQuestionSubmitted());
        navigate(ROUTE_PATHS.CONSULTATION_HISTORY);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [questionSubmitted, dispatch, navigate]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('askQuestion')}
        </h1>
        {questionSubmitted && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('questionSubmitted')}
            className="mb-4"
          />
        )}
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadSpecialtiesRequested())}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <Formik
            initialValues={{ specialtyId: '', question: '' }}
            validationSchema={questionSchema}
            onSubmit={(values) => {
              // Do not resetForm: fires before the saga completes, losing form data on error retry.
              dispatch(
                askQuestionRequested({ question: values.question, specialtyId: values.specialtyId })
              );
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
                {!loading && specialties.length === 0 && (
                  <InlineAlert
                    variant="warning"
                    title={t('common:noData')}
                    message={t('noSpecialties')}
                  />
                )}

                <div>
                  <label
                    htmlFor="question"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t('yourQuestion')}
                  </label>
                  <FormikTextArea name="question" label="" rows={8} data-cy="ask-question-text" />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    data-cy="ask-question-submit"
                  >
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
