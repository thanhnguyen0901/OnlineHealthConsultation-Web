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
import {
  loadHistoryRequested,
  rateConsultationRequested,
  cancelAppointmentRequested,
} from '@/features/patient/redux/patient.slice';
import {
  selectQuestions,
  selectAppointments,
  selectPatientLoading,
} from '@/features/patient/redux/patient.selectors';
import type { Question, Appointment } from '../types';

export const ConsultationHistoryPage: React.FC = () => {
  const { t } = useTranslation('patient');
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectPatientLoading);
  // Ref tracks previous ratings count; detects new entries without triggering re-render.
  const ratingsRef = React.useRef<number | null>(null);
  const ratings = useAppSelector((s) => s.patient.ratings);

  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    dispatch(loadHistoryRequested());
  }, [dispatch]);

  // Saga dispatches toast; dialog closes when ratings.length increases.
  useEffect(() => {
    if (ratingsRef.current !== null && ratings.length > ratingsRef.current) {
      setRatingDialog(false);
    }
    ratingsRef.current = ratings.length;
  }, [ratings.length]);

  const handleOpenDetail = (appointment: Appointment) => {
    setDetailAppointment(appointment);
    setDetailDialog(true);
  };

  const handleOpenAppointmentRating = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedQuestion(null);
    setRatingValue(0);
    setComment('');
    setRatingDialog(true);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) return;

    if (selectedAppointment && selectedAppointment.doctorId) {
      dispatch(
        rateConsultationRequested({
          consultationId: selectedAppointment.id,
          doctorId: selectedAppointment.doctorId,
          rating: ratingValue,
          comment: comment || undefined,
        })
      );
    } else if (selectedQuestion && selectedQuestion.doctorId) {
      // Question ratings are not yet supported by backend.
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
    const statusMap: Record<string, { severity: 'success' | 'warning' | 'info'; label: string }> = {
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
    const statusMap: Record<
      string,
      { severity: 'success' | 'warning' | 'danger' | 'info'; label: string }
    > = {
      // BE returns status lowercased; matches AppointmentStatus enum values.
      pending: { severity: 'warning', label: t('pending') },
      confirmed: { severity: 'info', label: t('confirmed') },
      completed: { severity: 'success', label: t('completed') },
      cancelled: { severity: 'danger', label: t('cancelled') },
    };

    const config = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const appointmentActionTemplate = (rowData: Appointment) => {
    const detailBtn = (
      <Button
        icon="pi pi-info-circle"
        size="sm"
        variant="secondary"
        onClick={() => handleOpenDetail(rowData)}
        title={t('viewDetail')}
      />
    );

    if (rowData.status === 'completed') {
      const actionBtn = rowData.hasRating ? (
        <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('rated')}</span>
      ) : (
        <Button
          label={t('rate')}
          icon="pi pi-star"
          size="sm"
          onClick={() => handleOpenAppointmentRating(rowData)}
        />
      );
      return (
        <div className="flex items-center gap-2">
          {actionBtn}
          {detailBtn}
        </div>
      );
    }
    if (rowData.status === 'pending' || rowData.status === 'confirmed') {
      return (
        <div className="flex items-center gap-2">
          <Button
            label={t('cancel')}
            icon="pi pi-times"
            size="sm"
            variant="danger"
            onClick={() => dispatch(cancelAppointmentRequested(rowData.id))}
          />
          {detailBtn}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm italic">{t('notAvailable')}</span>
        {detailBtn}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('consultationHistory')}
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {t('questions')}
            </h2>
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
                <Column
                  field="answer"
                  header={t('answer')}
                  body={(rowData: Question) =>
                    rowData.answer ? (
                      <span className="text-gray-800 dark:text-gray-200">{rowData.answer}</span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">—</span>
                    )
                  }
                />
                <Column
                  field="status"
                  header={t('status')}
                  body={questionStatusTemplate}
                  sortable
                  style={{ width: '150px' }}
                />
                <Column
                  field="createdAt"
                  header={t('date')}
                  body={dateTemplate}
                  sortable
                  style={{ width: '150px' }}
                />
              </DataTable>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {t('appointments')}
            </h2>
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
                <Column
                  field="date"
                  header={t('date')}
                  body={appointmentDateTemplate}
                  sortable
                  style={{ width: '150px' }}
                />
                <Column
                  field="reason"
                  header={t('reason')}
                  body={(rowData: Appointment) =>
                    rowData.reason ? (
                      <span
                        className="text-gray-800 dark:text-gray-200 block max-w-[220px] truncate"
                        title={rowData.reason}
                      >
                        {rowData.reason}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">—</span>
                    )
                  }
                />
                <Column
                  field="status"
                  header={t('status')}
                  body={appointmentStatusTemplate}
                  sortable
                  style={{ width: '150px' }}
                />
                <Column
                  body={appointmentActionTemplate}
                  header={t('actions')}
                  style={{ width: '200px' }}
                />
              </DataTable>
            </div>
          </section>
        </div>
      </div>

      <Dialog
        header={t('appointmentDetails')}
        visible={detailDialog}
        style={{ width: '480px' }}
        onHide={() => setDetailDialog(false)}
        modal
        className="p-dialog-custom"
      >
        {detailAppointment && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">{t('doctor')}</span>
              <span className="text-gray-900 dark:text-gray-100">
                {detailAppointment.doctorName ?? '—'}
              </span>

              <span className="font-medium text-gray-600 dark:text-gray-400">{t('date')}</span>
              <span className="text-gray-900 dark:text-gray-100">
                {new Date(detailAppointment.date).toLocaleString()}
              </span>

              <span className="font-medium text-gray-600 dark:text-gray-400">{t('status')}</span>
              <span>{appointmentStatusTemplate(detailAppointment as any)}</span>

              <span className="font-medium text-gray-600 dark:text-gray-400">{t('reason')}</span>
              <span className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {detailAppointment.reason || '—'}
              </span>

              <span className="font-medium text-gray-600 dark:text-gray-400">{t('notes')}</span>
              <span className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {detailAppointment.notes ? (
                  detailAppointment.notes
                ) : (
                  <span className="text-gray-400 italic">{t('noNotes')}</span>
                )}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setDetailDialog(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

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
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('rating')}
            </label>
            <Rating
              value={ratingValue}
              onChange={(e) => setRatingValue(e.value ?? 0)}
              stars={5}
              cancel={false}
              className="text-yellow-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('comment')}
            </label>
            <InputTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              placeholder={t('commentPlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRatingDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmitRating} disabled={ratingValue === 0} loading={loading}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
