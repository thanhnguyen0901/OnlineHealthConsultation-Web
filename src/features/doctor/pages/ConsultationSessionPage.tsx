import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { selectAccessToken, selectUser } from '@/features/auth/redux/auth.selectors';
import type { ConsultationSocketMessage } from '@/features/consultation/realtime/consultationSocketClient';
import { useConsultationSocket } from '@/features/consultation/realtime/useConsultationSocket';
import { useAppSelector } from '@/state/hooks';
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

const getSenderName = (message: ConsultationSocketMessage, fallback: string) =>
  [message.sender?.firstName, message.sender?.lastName].filter(Boolean).join(' ') || fallback;

const mergeMessages = (
  previous: ConsultationSocketMessage[],
  incoming: ConsultationSocketMessage | ConsultationSocketMessage[]
) => {
  const next = Array.isArray(incoming) ? incoming : [incoming];
  const seen = new Set(previous.map((item) => item.id).filter(Boolean));
  const merged = [...previous];

  next.forEach((item) => {
    if (item.id && seen.has(item.id)) return;
    if (item.id) seen.add(item.id);
    merged.push(item);
  });

  return merged.sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return leftTime - rightTime;
  });
};

const isCompleted = (result: ConsultationResult | null) =>
  result?.appointment?.status === 'COMPLETED' || result?.consultation?.status === 'COMPLETED';

const isOngoing = (result: ConsultationResult | null) => result?.consultation?.status === 'ONGOING';

export const ConsultationSessionPage: React.FC = () => {
  const { t, i18n } = useTranslation('doctor');
  const { appointmentId = '' } = useParams();
  const accessToken = useAppSelector(selectAccessToken);
  const currentUser = useAppSelector(selectUser);
  const [result, setResult] = React.useState<ConsultationResult | null>(null);
  const [messages, setMessages] = React.useState<ConsultationSocketMessage[]>([]);
  const [message, setMessage] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [items, setItems] = React.useState<PrescriptionItem[]>([{ ...emptyPrescriptionItem }]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sessionJoined, setSessionJoined] = React.useState(false);

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
        await doctorApi.joinConsultation(appointmentId);
        setSessionJoined(true);
        const history = (await doctorApi.getMessages(appointmentId)) as ConsultationSocketMessage[];
        setMessages((current) => mergeMessages(current, history));
      } else {
        setSessionJoined(false);
        setMessages([]);
      }
    } catch (err) {
      setSessionJoined(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  React.useEffect(() => {
    loadConsultation();
  }, [loadConsultation]);

  const appendRealtimeMessage = React.useCallback((incoming: ConsultationSocketMessage) => {
    setMessages((current) => mergeMessages(current, incoming));
  }, []);

  const handleSocketError = React.useCallback((socketError: Error) => {
    setError(socketError.message);
  }, []);

  const socket = useConsultationSocket({
    appointmentId,
    accessToken,
    enabled: Boolean(sessionJoined && isOngoing(result)),
    onMessage: appendRealtimeMessage,
    onError: handleSocketError,
  });

  const updateItem = (index: number, patch: Partial<PrescriptionItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSaveSummary = async () => {
    try {
      setError(null);
      await doctorApi.saveSummary(appointmentId, summary);
      setSuccess(t('consultationSummarySaved'));
      loadConsultation();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSavePrescription = async () => {
    try {
      setError(null);
      await doctorApi.createPrescription(appointmentId, {
        notes: result?.prescription?.notes,
        items,
      });
      setSuccess(t('prescriptionSaved'));
      loadConsultation();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStartConsultation = async () => {
    try {
      setError(null);
      await doctorApi.startConsultation(appointmentId);
      setSuccess(t('consultationStarted'));
      loadConsultation();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || !ongoing) return;

    setSending(true);
    setError(null);
    try {
      const sentViaSocket = socket.isConnected ? socket.sendMessage(content) : false;
      if (!sentViaSocket) {
        const saved = (await doctorApi.sendMessage(
          appointmentId,
          content
        )) as ConsultationSocketMessage;
        setMessages((current) => mergeMessages(current, saved));
      }
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  const handleEndConsultation = async () => {
    try {
      setError(null);
      await doctorApi.endConsultation(appointmentId);
      socket.disconnect();
      setSessionJoined(false);
      setSuccess(t('consultationEnded'));
      loadConsultation();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const completed = isCompleted(result);
  const ongoing = isOngoing(result);
  const prescriptionItems = result?.prescription?.items ?? [];
  const canEditClinicalContent = Boolean(result?.consultation);
  const socketHint =
    socket.status === 'reconnecting'
      ? t('consultationReconnecting')
      : socket.status === 'auth_error'
        ? t('consultationAuthExpired')
        : null;

  return (
    <div data-testid="consultation-session-page" className="space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="w-full space-y-6">
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
            severity={completed ? 'success' : ongoing ? 'info' : 'warning'}
            value={
              completed
                ? t('consultationCompleted')
                : ongoing
                  ? t('consultationOngoing')
                  : t('consultationNotStarted')
            }
            className="w-fit"
          />
        </div>

        {error && (
          <div data-testid="error-alert">
            <InlineAlert variant="error" title={t('consultationLoadError')} message={error} />
          </div>
        )}
        {success && <InlineAlert variant="success" title={t('success')} message={success} />}
        {socketHint && <InlineAlert variant="info" title={socketHint} />}

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

        {!completed && !ongoing && (
          <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t('consultationNotStarted')}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('consultationStartHint')}
                </p>
              </div>
              <Button
                data-testid="start-consultation"
                icon="pi pi-play"
                disabled={loading}
                loading={loading}
                onClick={handleStartConsultation}
              >
                {t('startConsultation')}
              </Button>
            </div>
          </section>
        )}

        {ongoing && (
          <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t('consultationChat')}
              </h2>
              <span className="text-xs text-gray-500">
                {socket.isConnected ? t('connected') : t('notConnected')}
              </span>
            </div>
            <div
              data-testid="chat-message-list"
              className="mb-3 max-h-80 min-h-[220px] space-y-3 overflow-auto rounded-lg border border-gray-100 p-3 dark:border-slate-800"
            >
              {messages.length === 0 ? (
                <p data-testid="empty-state" className="text-sm text-gray-400">
                  {t('noMessages')}
                </p>
              ) : (
                messages.map((item, index) => {
                  const mine =
                    item.sender?.id === currentUser?.id ||
                    item.senderUserId === currentUser?.id ||
                    item.sender?.role === 'DOCTOR';
                  const senderName = mine
                    ? t('you')
                    : getSenderName(item, item.sender?.role === 'PATIENT' ? t('patient') : t('doctor'));
                  return (
                    <div
                      key={item.id ?? `${item.createdAt ?? 'message'}-${index}`}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
                          mine
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-gray-100'
                        }`}
                      >
                        <div className={`mb-1 text-xs ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                          {senderName}
                        </div>
                        <div className="whitespace-pre-wrap">{item.content}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                data-testid="chat-message-input"
                placeholder={t('chatMessagePlaceholder')}
                disabled={sending}
              />
              <Button
                data-testid="send-message"
                icon="pi pi-send"
                disabled={!message.trim() || loading || sending}
                loading={sending}
                onClick={handleSendMessage}
              >
                {t('send')}
              </Button>
              <Button
                data-testid="end-consultation"
                variant="danger"
                disabled={loading || sending}
                onClick={handleEndConsultation}
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
          <InputTextarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={5}
            className="w-full"
            data-testid="consultation-summary-input"
            disabled={!canEditClinicalContent}
            placeholder={canEditClinicalContent ? undefined : t('consultationStartRequired')}
          />
          <Button
            className="mt-3"
            data-testid="save-summary"
            onClick={handleSaveSummary}
            disabled={!canEditClinicalContent || loading}
            loading={loading}
          >
            {t('saveSummary')}
          </Button>
        </section>

        <section data-testid="prescription-form" className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('prescription')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('prescriptionSubtitle')}</p>
          </div>

          {prescriptionItems.length > 0 && (
            <div className="mb-4 overflow-x-auto">
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
          )}

          {completed ? (
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
                <Button
                  data-testid="save-prescription"
                  onClick={handleSavePrescription}
                  disabled={loading}
                  loading={loading}
                >
                  {t('savePrescription')}
                </Button>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700">
              {t('prescriptionAfterComplete')}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
