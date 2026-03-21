import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadQuestionsRequested,
  answerQuestionRequested,
  clearAnswerSubmitted,
} from '../redux/doctor.slice';
import {
  selectQuestions,
  selectDoctorLoading,
  selectAnswerSubmitted,
  selectDoctorError,
} from '../redux/doctor.selectors';
import type { DoctorQuestion } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

export const InboxQuestionsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const loading = useAppSelector(selectDoctorLoading);
  const answerSubmitted = useAppSelector(selectAnswerSubmitted);
  const error = useAppSelector(selectDoctorError);

  const [answerDialog, setAnswerDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DoctorQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerSuccess, setAnswerSuccess] = useState(false);
  const [answerAttempted, setAnswerAttempted] = useState(false);

  useEffect(() => {
    dispatch(loadQuestionsRequested());
  }, [dispatch]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (answerSubmitted) {
      setAnswerDialog(false);
      setAnswerText('');
      setAnswerSuccess(true);
      setAnswerAttempted(false);
      timer = setTimeout(() => setAnswerSuccess(false), 2000);
      dispatch(clearAnswerSubmitted());
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [answerSubmitted, dispatch]);

  const handleOpenAnswer = (question: DoctorQuestion) => {
    setSelectedQuestion(question);
    setAnswerText('');
    setAnswerAttempted(false);
    setAnswerDialog(true);
  };

  const handleSubmitAnswer = () => {
    setAnswerAttempted(true);
    if (selectedQuestion && answerText.trim()) {
      dispatch(
        answerQuestionRequested({
          questionId: selectedQuestion.id,
          answer: answerText,
        })
      );
      // Dialog closes when answerSubmitted becomes true.
    }
  };

  const actionTemplate = (rowData: DoctorQuestion) => {
    if (rowData.status === 'pending') {
      return (
        <Button
          label={t('answer')}
          icon="pi pi-reply"
          size="sm"
          onClick={() => handleOpenAnswer(rowData)}
        />
      );
    }
    return <span className="text-green-600 font-semibold">{t('answered')}</span>;
  };

  const dateTemplate = (rowData: DoctorQuestion) => {
    return new Date(rowData.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const statusTemplate = (rowData: DoctorQuestion) => {
    const statusMap: Record<string, { severity: 'success' | 'warning' | 'info'; label: string }> = {
      pending: { severity: 'warning', label: t('pending') },
      answered: { severity: 'success', label: t('answered') },
      moderated: { severity: 'info', label: t('moderated') },
    };

    const config = statusMap[rowData.status] || {
      severity: 'info',
      label: translateEnumValue(t, 'status', rowData.status),
    };
    return <Tag value={config.label} severity={config.severity} />;
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('inbox')}
        </h1>
        {answerSuccess && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('answerSubmitted')}
            className="mb-4"
          />
        )}
        {error && (
          <InlineAlert
            variant="error"
            title={
              isUnauthorizedMessage(error)
                ? t('common:errorUnauthorized')
                : t('common:error')
            }
            message={error}
            onRetry={() => dispatch(loadQuestionsRequested())}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={questions}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noQuestions')}
            className="primereact-table"
          >
            <Column field="patientName" header={t('patient')} sortable style={{ width: '180px' }} />
            <Column field="question" header={t('question')} />
            <Column
              field="createdAt"
              header={t('date')}
              body={dateTemplate}
              sortable
              style={{ width: '140px' }}
            />
            <Column
              field="status"
              header={t('status')}
              body={statusTemplate}
              sortable
              style={{ width: '140px' }}
            />
            <Column body={actionTemplate} header={t('actions')} style={{ width: '160px' }} />
          </DataTable>
        </div>
      </div>

      <Dialog
        header={t('answerQuestion')}
        visible={answerDialog}
        style={{ width: '650px' }}
        onHide={() => setAnswerDialog(false)}
        modal
      >
        <div className="p-6 space-y-5">
          {selectedQuestion && (
            <div className="pb-2">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('question')}:
              </label>
              <div className="text-gray-800 dark:text-gray-200 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                {selectedQuestion.question}
              </div>
            </div>
          )}

          {selectedQuestion?.patientMedicalHistory && (
            <details className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
              <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-300 select-none hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                {t('patientMedicalHistory')}
              </summary>
              <div className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap border-t border-amber-200 dark:border-amber-700">
                {selectedQuestion.patientMedicalHistory}
              </div>
            </details>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('yourAnswer')}
            </label>
            <InputTextarea
              value={answerText}
              onChange={(e) => {
                setAnswerText(e.target.value);
                if (answerAttempted) setAnswerAttempted(false);
              }}
              rows={6}
              className="w-full"
              placeholder={t('enterAnswer')}
            />
            {answerAttempted && !answerText.trim() && (
              <small className="block mt-1 text-red-500">{t('enterAnswer')}</small>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={() => setAnswerDialog(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmitAnswer} disabled={!answerText.trim()} loading={loading}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
