import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import * as doctorApi from '../apis/doctor.api';

type PrescriptionItem = {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};

type ConsultationResult = {
  appointment?: {
    scheduledAt?: string;
    status?: string;
    reason?: string;
    notes?: string;
    patient?: {
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
  consultation?: {
    status?: string;
    startedAt?: string;
    endedAt?: string;
    summary?: string;
  } | null;
  prescription?: {
    notes?: string;
    items?: PrescriptionItem[];
  } | null;
};

const emptyPrescriptionItem: PrescriptionItem = {
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
};

const getPatientName = (result: ConsultationResult | null, fallback: string) => {
  const user = result?.appointment?.patient?.user;
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || fallback;
};

const isCompleted = (result: ConsultationResult | null) =>
  result?.appointment?.status === 'COMPLETED' || result?.consultation?.status === 'COMPLETED';

export const ConsultationSessionPage: React.FC = () => {
  const { t, i18n } = useTranslation('doctor');
  const { appointmentId = '' } = useParams();
  const [result, setResult] = React.useState<ConsultationResult | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [message, setMessage] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [items, setItems] = React.useState<PrescriptionItem[]>([{ ...emptyPrescriptionItem }]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const formatDateTime = React.useCallback(
    (value?: string) => {
      if (!value) return t('notUpdated');
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return t('notUpdated');
      return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    [i18n.language, t]
  );

  const loadConsultation = React.useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await doctorApi.getConsultationResult(appointmentId)) as ConsultationResult;
      setResult(data);
      setSummary(data.consultation?.summary ?? '');
      setItems(
        data.prescription?.items?.length ? data.prescription.items : [{ ...emptyPrescriptionItem }]
      );

      if (data.consultation?.status === 'ONGOING') {
        setMessages(await doctorApi.getMessages(appointmentId));
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  React.useEffect(() => {
    loadConsultation();
  }, [loadConsultation]);

  const updateItem = (index: number, patch: Partial<PrescriptionItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSaveSummary = async () => {
    setError(null);
    await doctorApi.saveSummary(appointmentId, summary);
    setSuccess(t('consultationSummarySaved'));
    loadConsultation();
  };

  const handleSavePrescription = async () => {
    setError(null);
    await doctorApi.createPrescription(appointmentId, {
      notes: result?.prescription?.notes,
      items,
    });
    setSuccess(t('prescriptionSaved'));
    loadConsultation();
  };

  const completed = isCompleted(result);
  const prescriptionItems = result?.prescription?.items ?? [];

  return (
    <div data-testid="consultation-session-page" className="space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('consultationSessionTitle')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('consultationSessionSubtitle')}
            </p>
          </div>
          <Tag
            severity={completed ? 'success' : 'info'}
            value={completed ? t('consultationCompleted') : t('consultationOngoing')}
            className="w-fit"
          />
        </div>

        {error && (
          <div data-testid="error-alert">
            <InlineAlert variant="error" title={t('consultationLoadError')} message={error} />
          </div>
        )}
        {success && <InlineAlert variant="success" title={t('success')} message={success} />}

        <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('patient')}
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {getPatientName(result, t('patient'))}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('appointmentTime')}
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {formatDateTime(result?.appointment?.scheduledAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('reason')}
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {result?.appointment?.reason ?? t('notUpdated')}
              </p>
            </div>
          </div>
        </section>

        {!completed && (
          <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
            <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">
              {t('consultationChat')}
            </h2>
            <div data-testid="chat-message-list" className="mb-3 max-h-64 space-y-2 overflow-auto">
              {messages.length === 0 ? (
                <p data-testid="empty-state" className="text-sm text-gray-400">
                  {t('noMessages')}
                </p>
              ) : (
                messages.map((item) => (
                  <div
                    key={item.id ?? item.createdAt}
                    className="rounded-lg bg-gray-100 p-2 text-sm dark:bg-slate-800"
                  >
                    {item.content}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                data-testid="chat-message-input"
                placeholder={t('chatMessagePlaceholder')}
              />
              <Button
                data-testid="send-message"
                disabled={!message.trim() || loading}
                onClick={async () => {
                  await doctorApi.sendMessage(appointmentId, message);
                  setMessage('');
                  loadConsultation();
                }}
              >
                {t('send')}
              </Button>
              <Button
                data-testid="end-consultation"
                variant="danger"
                onClick={async () => {
                  await doctorApi.endConsultation(appointmentId);
                  loadConsultation();
                }}
              >
                {t('endConsultation')}
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">
            {t('consultationSummary')}
          </h2>
          {completed ? (
            <p
              data-testid="consultation-summary-text"
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-700 dark:bg-slate-950 dark:text-gray-200"
            >
              {result?.consultation?.summary || t('notUpdated')}
            </p>
          ) : (
            <>
              <InputTextarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={5}
                className="w-full"
                data-testid="consultation-summary-input"
              />
              <Button className="mt-3" data-testid="save-summary" onClick={handleSaveSummary}>
                {t('saveSummary')}
              </Button>
            </>
          )}
        </section>

        <section data-testid="prescription-form" className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('prescription')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('prescriptionSubtitle')}</p>
          </div>

          {completed ? (
            prescriptionItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700">
                {t('noPrescriptionItems')}
              </p>
            ) : (
              <div className="overflow-x-auto">
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
                    {prescriptionItems.map((item, index) => (
                      <tr key={`${item.medicationName}-${index}`} className="align-top">
                        <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-900 dark:border-gray-800 dark:text-white">
                          {item.medicationName}
                        </td>
                        <td className="border-b border-gray-100 px-3 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-200">
                          {item.dosage}
                        </td>
                        <td className="border-b border-gray-100 px-3 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-200">
                          {item.frequency}
                        </td>
                        <td className="border-b border-gray-100 px-3 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-200">
                          {item.duration}
                        </td>
                        <td className="border-b border-gray-100 px-3 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-200">
                          {item.notes || t('notUpdated')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} data-testid="prescription-item-row" className="grid grid-cols-1 gap-2 md:grid-cols-5">
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                      placeholder={t('medicationName')}
                      value={item.medicationName}
                      onChange={(event) => updateItem(index, { medicationName: event.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                      placeholder={t('dosage')}
                      value={item.dosage}
                      onChange={(event) => updateItem(index, { dosage: event.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                      placeholder={t('frequency')}
                      value={item.frequency}
                      onChange={(event) => updateItem(index, { frequency: event.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                      placeholder={t('duration')}
                      value={item.duration}
                      onChange={(event) => updateItem(index, { duration: event.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                      placeholder={t('notes')}
                      value={item.notes ?? ''}
                      onChange={(event) => updateItem(index, { notes: event.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setItems((prev) => [...prev, { ...emptyPrescriptionItem }])}
                >
                  {t('addMedication')}
                </Button>
                <Button data-testid="save-prescription" onClick={handleSavePrescription}>
                  {t('savePrescription')}
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
