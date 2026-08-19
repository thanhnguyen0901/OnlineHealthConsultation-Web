import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Tag } from 'primereact/tag';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { Spinner } from '@/components/common/Spinner';
import { ROUTE_PATHS } from '@/constants/routePaths';
import { selectAccessToken, selectUser } from '@/features/auth/redux/auth.selectors';
import { useConsultationSocket } from '@/features/consultation/realtime/useConsultationSocket';
import type { ConsultationSocketMessage } from '@/features/consultation/realtime/consultationSocketClient';
import { useAppSelector } from '@/state/hooks';
import { HttpError } from '@/apis/core/httpError';
import * as patientApi from '../apis/patient.api';
import type {
  ConsultationJoinResult,
  ConsultationMessage,
  ConsultationResult,
  ConsultationParticipant,
} from '../types';

type SessionViewState = 'loading' | 'joinable' | 'not_started' | 'ongoing' | 'completed' | 'error';

const normalizeStatus = (value?: string | null) => (value ?? '').toUpperCase();

const fullName = (user?: ConsultationParticipant | null, fallback = '') =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') || fallback;

const mergeMessages = (
  previous: ConsultationMessage[],
  incoming: ConsultationMessage | ConsultationMessage[]
) => {
  const next = Array.isArray(incoming) ? incoming : [incoming];
  const seen = new Set(previous.map((message) => message.id).filter(Boolean));
  const merged = [...previous];

  next.forEach((message) => {
    if (message.id && seen.has(message.id)) return;
    if (message.id) seen.add(message.id);
    merged.push(message);
  });

  return merged.sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return leftTime - rightTime;
  });
};

const classifyJoinError = (error: unknown): SessionViewState => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('has not been started')) return 'not_started';
  if (message.includes('outside allowed time window')) return 'error';
  if (error instanceof HttpError && error.statusCode === 403) return 'error';
  return 'error';
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unexpected error');

export const PatientConsultationSessionPage: React.FC = () => {
  const { t, i18n } = useTranslation(['patient', 'common']);
  const navigate = useNavigate();
  const { appointmentId = '' } = useParams();
  const accessToken = useAppSelector(selectAccessToken);
  const currentUser = useAppSelector(selectUser);
  const [result, setResult] = React.useState<ConsultationResult | null>(null);
  const [joined, setJoined] = React.useState<ConsultationJoinResult | null>(null);
  const [messages, setMessages] = React.useState<ConsultationMessage[]>([]);
  const [draft, setDraft] = React.useState('');
  const [viewState, setViewState] = React.useState<SessionViewState>('loading');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refreshResult = React.useCallback(async () => {
    if (!appointmentId) return null;
    const data = await patientApi.getConsultationResult(appointmentId);
    setResult(data);
    const appointmentStatus = normalizeStatus(data.appointment?.status);
    const consultationStatus = normalizeStatus(data.consultation?.status);

    if (appointmentStatus === 'COMPLETED' || consultationStatus === 'COMPLETED') {
      setViewState('completed');
      return data;
    }

    if (consultationStatus === 'ONGOING') {
      setViewState(joined ? 'ongoing' : 'joinable');
      return data;
    }

    setViewState('joinable');
    return data;
  }, [appointmentId, joined]);

  const appendRealtimeMessage = React.useCallback((message: ConsultationSocketMessage) => {
    setMessages((current) => mergeMessages(current, message));
  }, []);

  const handleSocketError = React.useCallback((socketError: Error) => {
    setError(socketError.message);
  }, []);

  const socket = useConsultationSocket({
    appointmentId,
    accessToken,
    enabled: Boolean(joined && viewState === 'ongoing'),
    onMessage: appendRealtimeMessage,
    onError: handleSocketError,
  });

  const loadAndJoin = React.useCallback(async () => {
    if (!appointmentId) {
      setError(t('invalidConsultation'));
      setViewState('error');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await patientApi.getConsultationResult(appointmentId);
      setResult(data);

      const appointmentStatus = normalizeStatus(data.appointment?.status);
      const consultationStatus = normalizeStatus(data.consultation?.status);
      if (appointmentStatus === 'COMPLETED' || consultationStatus === 'COMPLETED') {
        setViewState('completed');
        return;
      }

      setViewState('joinable');
      const joinResult = await patientApi.joinConsultation(appointmentId);
      setJoined(joinResult);
      setViewState(normalizeStatus(joinResult.status) === 'COMPLETED' ? 'completed' : 'ongoing');
      const history = await patientApi.getConsultationMessages(appointmentId);
      setMessages((current) => mergeMessages(current, history));
    } catch (joinError) {
      setViewState(classifyJoinError(joinError));
      setError(getErrorMessage(joinError));
    } finally {
      setLoading(false);
    }
  }, [appointmentId, t]);

  React.useEffect(() => {
    loadAndJoin();
    return () => socket.disconnect();
  }, [loadAndJoin]);

  React.useEffect(() => {
    if (viewState !== 'ongoing') return undefined;
    const timer = window.setInterval(async () => {
      try {
        const data = await refreshResult();
        const completed =
          normalizeStatus(data?.appointment?.status) === 'COMPLETED' ||
          normalizeStatus(data?.consultation?.status) === 'COMPLETED';
        if (completed) {
          socket.disconnect();
        }
      } catch {
        // Keep the live chat usable; the next poll or user action can surface an error.
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshResult, socket, viewState]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || viewState !== 'ongoing') return;

    setSending(true);
    setError(null);
    try {
      const sentViaSocket = socket.isConnected ? socket.sendMessage(content) : false;
      if (!sentViaSocket) {
        const saved = await patientApi.sendConsultationMessage(appointmentId, content);
        setMessages((current) => mergeMessages(current, saved));
        setError(null);
      }
      setDraft('');
    } catch (sendError) {
      setError(getErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return t('notAvailable');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('notAvailable');
    return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const doctorName = fullName(result?.appointment?.doctor?.user, t('doctor'));
  const channel = joined?.channel ?? result?.consultation?.channel ?? 'CHAT';
  const isCompleted = viewState === 'completed';
  const isOngoing = viewState === 'ongoing';
  const socketHint =
    socket.status === 'reconnecting'
      ? t('consultationReconnecting')
      : socket.status === 'auth_error'
        ? t('consultationAuthExpired')
        : null;

  if (loading && !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" data-testid="patient-consultation-page">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="patient-consultation-page" className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('liveConsultation')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('liveConsultationSubtitle')}
            </p>
          </div>
          <Tag
            severity={isCompleted ? 'success' : isOngoing ? 'info' : 'warning'}
            value={
              isCompleted
                ? t('consultationCompleted')
                : isOngoing
                  ? t('consultationOngoing')
                  : viewState === 'not_started'
                    ? t('consultationNotStarted')
                    : t('consultationJoinable')
            }
            className="w-fit"
          />
        </div>

        {error && (
          <div data-testid="error-alert">
            <InlineAlert
              variant={viewState === 'not_started' ? 'warning' : 'error'}
              title={
                viewState === 'not_started'
                  ? t('consultationNotStarted')
                  : t('consultationUnavailable')
              }
              message={error}
              retryLabel={t('common:retry')}
              onRetry={loadAndJoin}
            />
          </div>
        )}
        {socketHint && <InlineAlert variant="info" title={socketHint} />}

        <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">{t('doctor')}</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">{doctorName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">{t('appointmentTime')}</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {formatDateTime(result?.appointment?.scheduledAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">{t('consultationChannel')}</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {channel === 'VIDEO' ? t('videoConsultation') : t('chatConsultation')}
              </p>
            </div>
          </div>
        </section>

        {channel === 'VIDEO' && (
          <section className="rounded-lg bg-slate-950 p-4 text-white shadow-sm" data-testid="mock-video-panel">
            <div className="grid min-h-[220px] grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
              <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
                <div className="text-center">
                  <i className="pi pi-video text-3xl" />
                  <p className="mt-2 font-medium">{doctorName}</p>
                  <p className="text-sm text-slate-400">{t('mockVideoSession')}</p>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                <div className="text-center">
                  <i className="pi pi-user text-2xl" />
                  <p className="mt-2 text-sm">{t('you')}</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">{t('videoFallbackHint')}</p>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('consultationChat')}</h2>
              <span className="text-xs text-gray-500">
                {socket.isConnected ? t('connected') : t('notConnected')}
              </span>
            </div>

            <div
              data-testid="chat-message-list"
              className="mb-4 max-h-[420px] min-h-[260px] space-y-3 overflow-auto rounded-lg border border-gray-100 p-3 dark:border-slate-800"
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
                    item.sender?.role === 'PATIENT';
                  const senderName = mine
                    ? t('you')
                    : fullName(item.sender, item.sender?.role === 'DOCTOR' ? t('doctor') : t('patient'));
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

            {isCompleted ? (
              <InlineAlert
                variant="success"
                title={t('consultationCompleted')}
                message={t('consultationCompletedHint')}
              />
            ) : viewState === 'not_started' ? (
              <InlineAlert
                variant="warning"
                title={t('consultationNotStarted')}
                message={t('consultationNotStartedHint')}
              />
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-950"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t('chatMessagePlaceholder')}
                  data-testid="chat-message-input"
                  disabled={!isOngoing || sending}
                />
                <Button
                  data-testid="send-message"
                  icon="pi pi-send"
                  disabled={!draft.trim() || !isOngoing || sending}
                  loading={sending}
                  onClick={sendMessage}
                >
                  {t('send')}
                </Button>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('appointmentDetails')}</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">{t('reason')}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {result?.appointment?.reason || t('notAvailable')}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">{t('notes')}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {result?.appointment?.notes || t('noNotes')}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('consultationResult')}</h2>
              {!isCompleted ? (
                <p className="mt-2 text-sm text-gray-500">{t('resultAvailableAfterCompletion')}</p>
              ) : (
                <div className="mt-3 space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium">{t('summary')}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                      {result?.consultation?.summary || t('noSummaryAvailable')}
                    </p>
                  </div>
                  <div data-testid="prescription-items">
                    <h3 className="font-medium">{t('prescription')}</h3>
                    {result?.prescription?.items?.length ? (
                      <ul className="mt-2 space-y-2">
                        {result.prescription.items.map((item) => (
                          <li
                            key={item.id ?? item.medicationName}
                            className="rounded-lg border border-gray-100 p-2 dark:border-slate-800"
                          >
                            <div className="font-medium">{item.medicationName}</div>
                            <div className="text-gray-500">
                              {item.dosage} · {item.frequency} · {item.duration}
                            </div>
                            {item.notes && <div className="mt-1 text-gray-500">{item.notes}</div>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-gray-400 italic">{t('noPrescriptionAvailable')}</p>
                    )}
                  </div>
                </div>
              )}
              <Button
                className="mt-4 w-full"
                variant="secondary"
                icon="pi pi-history"
                onClick={() => navigate(ROUTE_PATHS.CONSULTATION_HISTORY)}
              >
                {t('backToHistory')}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
