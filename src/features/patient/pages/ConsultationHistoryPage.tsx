import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadHistoryRequested, rateConsultationRequested } from '@/features/patient/redux/patient.slice';
import { selectQuestions, selectAppointments, selectPatientLoading } from '@/features/patient/redux/patient.selectors';
import type { Question } from '../types';

export const ConsultationHistoryPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectPatientLoading);

  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    dispatch(loadHistoryRequested());
  }, [dispatch]);

  const handleOpenRating = (question: Question) => {
    setSelectedQuestion(question);
    setRatingValue(0);
    setComment('');
    setRatingDialog(true);
  };

  const handleSubmitRating = () => {
    if (selectedQuestion && ratingValue > 0) {
      dispatch(
        rateConsultationRequested({
          consultationId: selectedQuestion.id,
          rating: ratingValue,
          comment: comment || undefined,
        })
      );
      setRatingDialog(false);
    }
  };

  const actionTemplate = (rowData: Question) => {
    if (rowData.status === 'answered') {
      return (
        <Button
          label={t('rateConsultation')}
          icon="pi pi-star"
          className="p-button-sm p-button-outlined"
          onClick={() => handleOpenRating(rowData)}
        />
      );
    }
    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('consultationHistory')}</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">{t('questions')}</h2>
        <DataTable value={questions} paginator rows={10}>
          <Column field="question" header={t('question')} />
          <Column field="status" header={t('status')} />
          <Column field="createdAt" header={t('date')} />
          <Column body={actionTemplate} header={t('actions')} style={{ width: '150px' }} />
        </DataTable>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">{t('appointments')}</h2>
        <DataTable value={appointments} paginator rows={10}>
          <Column field="doctorName" header={t('doctor')} />
          <Column field="date" header={t('date')} />
          <Column field="status" header={t('status')} />
        </DataTable>
      </div>

      <Dialog
        header={t('rateConsultation')}
        visible={ratingDialog}
        style={{ width: '450px' }}
        onHide={() => setRatingDialog(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">{t('rating')}</label>
            <Rating value={ratingValue} onChange={(e) => setRatingValue(e.value ?? 0)} stars={5} cancel={false} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">{t('comment')}</label>
            <InputTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              placeholder={t('commentPlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button label={t('cancel')} className="p-button-text" onClick={() => setRatingDialog(false)} />
            <Button
              label={t('submit')}
              onClick={handleSubmitRating}
              disabled={ratingValue === 0}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
