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
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">{t('consultationHistory')}</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t('questions')}</h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
              <DataTable 
            value={questions} 
            paginator 
            rows={10}
            loading={loading}
            emptyMessage={t('noQuestions')}
            className="text-sm"
          >
            <Column field="question" header={t('question')} sortable />
            <Column field="status" header={t('status')} sortable style={{ width: '150px' }} />
            <Column field="createdAt" header={t('date')} sortable style={{ width: '150px' }} />
              <Column body={actionTemplate} header={t('actions')} style={{ width: '180px' }} />
            </DataTable>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t('appointments')}</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
            <DataTable 
            value={appointments} 
            paginator 
            rows={10}
            loading={loading}
            emptyMessage={t('noAppointments')}
            className="text-sm"
          >
            <Column field="doctorName" header={t('doctor')} sortable />
            <Column field="date" header={t('date')} sortable style={{ width: '150px' }} />
              <Column field="status" header={t('status')} sortable style={{ width: '150px' }} />
            </DataTable>
          </div>
        </section>
      </div>
      </div>

      <Dialog
        header={t('rateConsultation')}
        visible={ratingDialog}
        style={{ width: '500px' }}
        onHide={() => setRatingDialog(false)}
        modal
      >
        <div className="p-6 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('rating')}</label>
            <Rating 
              value={ratingValue} 
              onChange={(e) => setRatingValue(e.value ?? 0)} 
              stars={5} 
              cancel={false}
              className="text-yellow-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('comment')}</label>
            <InputTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              placeholder={t('commentPlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="secondary" 
              onClick={() => setRatingDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={ratingValue === 0}
              loading={loading}
            >
              {t('submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
