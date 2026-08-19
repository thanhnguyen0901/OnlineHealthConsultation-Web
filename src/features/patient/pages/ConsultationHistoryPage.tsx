import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
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
  selectPatientError,
} from '@/features/patient/redux/patient.selectors';
import type { Question, Appointment } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';
import * as patientApi from '../apis/patient.api';
import { ROUTE_PATHS } from '@/constants/routePaths';

export const ConsultationHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation(['patient', 'common']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectPatientLoading);
  const error = useAppSelector(selectPatientError);
  // Ref tracks previous ratings count; detects new entries without triggering re-render.
  const ratingsRef = React.useRef<number | null>(null);
  const ratings = useAppSelector((s) => s.patient.ratings);

  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [questionDetail, setQuestionDetail] = useState<Question | null>(null);
  const [resultDialog, setResultDialog] = useState(false);
  const [consultationResult, setConsultationResult] = useState<any | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    dispatch(loadHistoryRequested());
  }, [dispatch]);

  // Saga dispatches toast; dialog closes when ratings.length increases.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (ratingsRef.current !== null && ratings.length > ratingsRef.current) {
      setRatingDialog(false);
      setRatingSuccess(true);
      timer = setTimeout(() => setRatingSuccess(false), 2000);
    }
    ratingsRef.current = ratings.length;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [ratings.length]);

  const handleOpenDetail = async (appointment: Appointment) => {
    setDetailAppointment(appointment);
    setDetailDialog(true);
    try {
      setDetailAppointment(await patientApi.getAppointmentDetail(appointment.id));
    } catch {
      setDetailAppointment(appointment);
    }
  };

  const handleOpenResult = async (appointment: Appointment) => {
    setResultDialog(true);
    setConsultationResult(null);
    try {
      setConsultationResult(await patientApi.getConsultationResult(appointment.id));
    } catch (error) {
      setConsultationResult({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  const handleOpenAppointmentRating = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRatingValue(0);
    setComment('');
    setRatingDialog(true);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) return;

    if (selectedAppointment && selectedAppointment.doctorId) {
      dispatch(
        rateConsultationRequested({
          appointmentId: selectedAppointment.id,
          score: ratingValue,
          comment: comment || undefined,
        })
      );
    }
  };

  const dateTemplate = (rowData: Question) => {
    return new Date(rowData.createdAt).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US'
    );
  };

  const questionStatusTemplate = (rowData: Question) => {
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

  const appointmentDateTemplate = (rowData: any) => {
    return new Date(rowData.date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
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

    const config = statusMap[rowData.status] || {
      severity: 'info',
      label: translateEnumValue(t, 'status', rowData.status),
    };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const appointmentActionTemplate = (rowData: Appointment) => {
    const consultationPath = ROUTE_PATHS.PATIENT_CONSULTATION_SESSION.replace(
      ':appointmentId',
      rowData.id
    );
    const detailBtn = (
      <Button
        icon="pi pi-info-circle"
        size="sm"
        variant="secondary"
        onClick={() => handleOpenDetail(rowData)}
        title={t('viewDetail')}
        data-testid="appointment-detail"
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
          data-testid="rating-dialog"
        />
      );
      return (
        <div className="flex items-center gap-2">
          {actionBtn}
          <Button
            label={t('result')}
            icon="pi pi-file"
            size="sm"
            variant="secondary"
            onClick={() => handleOpenResult(rowData)}
            data-testid="consultation-result"
          />
          {detailBtn}
        </div>
      );
    }
    if (rowData.status === 'pending' || rowData.status === 'confirmed') {
      return (
        <div className="flex items-center gap-2">
          {rowData.status === 'confirmed' && (
            <Button
              label={t('joinConsultation')}
              icon="pi pi-comments"
              size="sm"
              onClick={() => navigate(consultationPath)}
              data-testid={`appointment-join-${rowData.id}`}
            />
          )}
          <Button
            label={t('cancel')}
            icon="pi pi-times"
            size="sm"
            variant="danger"
            onClick={() => dispatch(cancelAppointmentRequested(rowData.id))}
            data-testid={`appointment-cancel-${rowData.id}`}
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
    <div data-testid="appointment-list-page" className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('consultationHistory')}
        </h1>
        {ratingSuccess && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('ratingSubmitted')}
            className="mb-4"
          />
        )}
        {error && (
          <div data-testid="error-alert">
            <InlineAlert
              variant="error"
              title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
              message={error}
              onRetry={() => dispatch(loadHistoryRequested())}
              className="mb-4"
            />
          </div>
        )}

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
                data-testid="patient-question-table"
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
                <Column
                  body={(rowData: Question) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon="pi pi-info-circle"
                      onClick={() => setQuestionDetail(rowData)}
                      data-testid="question-detail"
                    />
                  )}
                  header={t('actions')}
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
                data-testid="patient-appointment-table"
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
                  style={{ width: '320px' }}
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
          <div data-testid="appointment-detail" className="p-6 space-y-4">
            <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">{t('doctor')}</span>
              <span className="text-gray-900 dark:text-gray-100">
                {detailAppointment.doctorName ?? '—'}
              </span>

              <span className="font-medium text-gray-600 dark:text-gray-400">{t('date')}</span>
              <span className="text-gray-900 dark:text-gray-100">
                {new Date(detailAppointment.date).toLocaleString(
                  i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                )}
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
              <Button size="sm" variant="secondary" onClick={() => setDetailDialog(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={t('questionDetail')}
        visible={Boolean(questionDetail)}
        style={{ width: '560px' }}
        onHide={() => setQuestionDetail(null)}
        modal
      >
        {questionDetail && (
          <div data-testid="question-detail" className="p-6 space-y-4">
            <h3 className="font-semibold">{questionDetail.title || t('question')}</h3>
            <p className="whitespace-pre-wrap">{questionDetail.question}</p>
            <div>
              <h4 className="font-medium">{t('answer')}</h4>
              <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                {questionDetail.answer || '—'}
              </p>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={t('consultationResult')}
        visible={resultDialog}
        style={{ width: '720px' }}
        onHide={() => setResultDialog(false)}
        modal
      >
        <div data-testid="consultation-result" className="p-6 space-y-4">
          {!consultationResult ? (
            <div data-testid="loading-state">{t('common:loading')}</div>
          ) : consultationResult.error ? (
            <div data-testid="error-alert">
              <InlineAlert variant="error" title={t('common:error')} message={consultationResult.error} />
            </div>
          ) : (
            <>
              <section>
                <h3 className="font-semibold">{t('summary')}</h3>
                <p className="mt-2 whitespace-pre-wrap">
                  {consultationResult.consultation?.summary ||
                    consultationResult.session?.summary ||
                    t('noSummaryAvailable')}
                </p>
              </section>
              <section data-testid="prescription-items">
                <h3 className="font-semibold">{t('prescription')}</h3>
                {consultationResult.prescription?.items?.length ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-slate-950">
                          <th className="rounded-l-lg border-y border-l border-gray-200 px-3 py-2 dark:border-gray-700">
                            {t('medicationName')}
                          </th>
                          <th className="border-y border-gray-200 px-3 py-2 dark:border-gray-700">
                            {t('dosage')}
                          </th>
                          <th className="border-y border-gray-200 px-3 py-2 dark:border-gray-700">
                            {t('frequency')}
                          </th>
                          <th className="border-y border-gray-200 px-3 py-2 dark:border-gray-700">
                            {t('duration')}
                          </th>
                          <th className="rounded-r-lg border-y border-r border-gray-200 px-3 py-2 dark:border-gray-700">
                            {t('notes')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultationResult.prescription.items.map((item: any) => (
                          <tr key={item.id ?? item.medicationName}>
                            <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-900 dark:border-gray-800 dark:text-white">
                              {item.medicationName}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                              {item.dosage}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                              {item.frequency || '—'}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                              {item.duration || '—'}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                              {item.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-400 italic">{t('noPrescriptionAvailable')}</p>
                )}
              </section>
            </>
          )}
        </div>
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
            <Button size="sm" variant="secondary" onClick={() => setRatingDialog(false)}>
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitRating}
              disabled={ratingValue === 0}
              loading={loading}
              data-testid="rating-submit"
            >
              {t('submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
