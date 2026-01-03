import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadHistoryRequested, rateConsultationRequested } from '@/features/patient/redux/patient.slice';
import { selectQuestions, selectAppointments, selectPatientLoading } from '@/features/patient/redux/patient.selectors';
import type { Question, Appointment } from '../types';
import { useToast } from '@/hooks/useToast';

export const ConsultationHistoryPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectPatientLoading);
  const { showSuccess, showError } = useToast();

  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(loadHistoryRequested());
  }, [dispatch]);

  // Track rating submission completion
  useEffect(() => {
    if (isSubmitting && !loading) {
      // Rating submission completed
      showSuccess(t('ratingSubmitted') || 'Rating submitted successfully');
      setRatingDialog(false);
      setIsSubmitting(false);
      // Reload history to get updated data
      setTimeout(() => dispatch(loadHistoryRequested()), 500);
    }
  }, [loading, isSubmitting, showSuccess, dispatch, t]);

  const handleOpenAppointmentRating = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedQuestion(null);
    setRatingValue(0);
    setComment('');
    setRatingDialog(true);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) return;

    setIsSubmitting(true);

    if (selectedAppointment && selectedAppointment.doctorId) {
      // Rating for appointment
      dispatch(
        rateConsultationRequested({
          consultationId: selectedAppointment.id,
          doctorId: selectedAppointment.doctorId,
          rating: ratingValue,
          comment: comment || undefined,
        })
      );
    } else if (selectedQuestion && selectedQuestion.doctorId) {
      // Rating for question (currently not supported by backend)
      dispatch(
        rateConsultationRequested({
          consultationId: selectedQuestion.id,
          doctorId: selectedQuestion.doctorId,
          rating: ratingValue,
          comment: comment || undefined,
        })
      );
    }
  };

  const dateTemplate = (rowData: Question) => {
    return new Date(rowData.createdAt).toLocaleDateString('vi-VN');
  };

  const questionStatusTemplate = (rowData: Question) => {
    const statusMap: Record<string, { severity: 'success' | 'warning' | 'info', label: string }> = {
      pending: { severity: 'warning', label: t('pending') },
      answered: { severity: 'success', label: t('answered') },
      moderated: { severity: 'info', label: t('moderated') },
    };
    
    const config = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const appointmentDateTemplate = (rowData: any) => {
    return new Date(rowData.date).toLocaleDateString('vi-VN');
  };

  const appointmentStatusTemplate = (rowData: any) => {
    const statusMap: Record<string, { severity: 'success' | 'warning' | 'danger' | 'info', label: string }> = {
      scheduled: { severity: 'info', label: t('scheduled') },
      completed: { severity: 'success', label: t('completed') },
      cancelled: { severity: 'danger', label: t('cancelled') },
    };
    
    const config = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const appointmentActionTemplate = (rowData: Appointment) => {
    if (rowData.status === 'completed') {
      if (rowData.hasRating) {
        return <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('rated')}</span>;
      }
      return (
        <Button
          label={t('rate')}
          icon="pi pi-star"
          size="sm"
          onClick={() => handleOpenAppointmentRating(rowData)}
        />
      );
    }
    return <span className="text-gray-400 text-sm italic">{t('notAvailable')}</span>;
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
            className="primereact-table"
          >
            <Column field="question" header={t('question')} sortable />
            <Column field="status" header={t('status')} body={questionStatusTemplate} sortable style={{ width: '150px' }} />
            <Column field="createdAt" header={t('date')} body={dateTemplate} sortable style={{ width: '150px' }} />
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
            className="primereact-table"
          >
            <Column field="doctorName" header={t('doctor')} sortable />
            <Column field="date" header={t('date')} body={appointmentDateTemplate} sortable style={{ width: '150px' }} />
              <Column field="status" header={t('status')} body={appointmentStatusTemplate} sortable style={{ width: '150px' }} />
              <Column body={appointmentActionTemplate} header={t('actions')} style={{ width: '180px' }} />
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
        className="p-dialog-custom"
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
