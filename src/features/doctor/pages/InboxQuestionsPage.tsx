import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('inbox')}</h1>
      <Card>
        <DataTable value={questions} paginator rows={10} loading={loading} emptyMessage={t('noQuestions')}>
          <Column field="patientName" header={t('patient')} />
          <Column field="question" header={t('question')} style={{ maxWidth: '400px' }} />
          <Column field="createdAt" header={t('date')} body={dateTemplate} style={{ width: '150px' }} />
          <Column field="status" header={t('status')} style={{ width: '120px' }} />
          <Column body={actionTemplate} header={t('actions')} style={{ width: '150px' }} />
        </DataTable>
      </Card>

      <Dialog
        header={t('answerQuestion')}
        visible={answerDialog}
        style={{ width: '600px' }}
        onHide={() => setAnswerDialog(false)}
      >
        <div className="space-y-4">
          {selectedQuestion && (
            <div>
              <h3 className="font-semibold mb-2">{t('question')}:</h3>
              <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                {selectedQuestion.question}
              </p>
            </div>
          )}
          <div>
            <label className="block mb-2 font-semibold">{t('yourAnswer')}</label>
            <InputTextarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              className="w-full"
              placeholder={t('enterAnswer')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button label={t('cancel')} variant="secondary" onClick={() => setAnswerDialog(false)} />
            <Button
              label={t('submit')}
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim()}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
