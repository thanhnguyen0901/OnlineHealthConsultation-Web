import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadQuestionsRequested, answerQuestionRequested } from '../redux/doctor.slice';
import { selectQuestions, selectDoctorLoading } from '../redux/doctor.selectors';
import type { DoctorQuestion } from '../types';

export const InboxQuestionsPage: React.FC = () => {
  const { t } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const loading = useAppSelector(selectDoctorLoading);

  const [answerDialog, setAnswerDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DoctorQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    dispatch(loadQuestionsRequested());
  }, [dispatch]);

  const handleOpenAnswer = (question: DoctorQuestion) => {
    setSelectedQuestion(question);
    setAnswerText('');
    setAnswerDialog(true);
  };

  const handleSubmitAnswer = () => {
    if (selectedQuestion && answerText.trim()) {
      dispatch(
        answerQuestionRequested({
          questionId: selectedQuestion.id,
          answer: answerText,
        })
      );
      setAnswerDialog(false);
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
    return new Date(rowData.createdAt).toLocaleDateString('vi-VN');
  };

  const statusTemplate = (rowData: DoctorQuestion) => {
    const statusMap: Record<string, { severity: 'success' | 'warning' | 'info'; label: string }> = {
      pending: { severity: 'warning', label: t('pending') },
      answered: { severity: 'success', label: t('answered') },
      moderated: { severity: 'info', label: t('moderated') },
    };

    const config = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag value={config.label} severity={config.severity} />;
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('inbox')}
        </h1>

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
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('yourAnswer')}
            </label>
            <InputTextarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              className="w-full"
              placeholder={t('enterAnswer')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAnswerDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmitAnswer} disabled={!answerText.trim()} loading={loading}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
