import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadDoctorAppointmentsRequested,
  updateDoctorAppointmentRequested,
  rescheduleAppointmentRequested,
  clearRescheduleSubmitted,
  clearAppointmentUpdated,
} from '../redux/doctor.slice';
import {
  selectDoctorAppointments,
  selectDoctorLoading,
  selectRescheduleSubmitted,
  selectAppointmentUpdated,
  selectDoctorError,
} from '../redux/doctor.selectors';
import type { DoctorAppointment } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';
import { translateEnumValue } from '@/utils/enumI18n';

const getNextStatuses = (
  current: DoctorAppointment['status']
): { label: string; value: string }[] => {
  switch (current) {
    case 'pending':
      return [
        { label: 'confirmAction', value: 'confirmed' },
        { label: 'cancel', value: 'cancelled' },
      ];
    case 'confirmed':
      return [
        { label: 'completeAction', value: 'completed' },
        { label: 'cancel', value: 'cancelled' },
      ];
    default:
      return [];
  }
};

const canReschedule = (status: DoctorAppointment['status']): boolean =>
  status === 'pending' || status === 'confirmed';

const toDateOnly = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const toTimeOnly = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(1970, 0, 1, d.getHours(), d.getMinutes(), 0, 0);
};

export const DoctorAppointmentsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectDoctorAppointments);
  const loading = useAppSelector(selectDoctorLoading);
  const rescheduleSubmitted = useAppSelector(selectRescheduleSubmitted);
  const appointmentUpdated = useAppSelector(selectAppointmentUpdated);
  const error = useAppSelector(selectDoctorError);

  const [rescheduleTarget, setRescheduleTarget] = useState<DoctorAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<Date | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const todayDate = useRef(new Date()).current;

  useEffect(() => {
    dispatch(loadDoctorAppointmentsRequested());
  }, [dispatch]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (rescheduleSubmitted) {
      setRescheduleTarget(null);
      setRescheduleDate(null);
      setRescheduleTime(null);
      setRescheduleError('');
      setRescheduleSuccess(true);
      timer = setTimeout(() => setRescheduleSuccess(false), 2000);
      dispatch(clearRescheduleSubmitted());
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [rescheduleSubmitted, dispatch]);

  useEffect(() => {
    if (!appointmentUpdated) return;
    const timer = window.setTimeout(() => {
      dispatch(clearAppointmentUpdated());
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [appointmentUpdated, dispatch]);

  const openRescheduleDialog = (row: DoctorAppointment) => {
    setRescheduleTarget(row);
    setRescheduleDate(toDateOnly(row.scheduledAt));
    setRescheduleTime(toTimeOnly(row.scheduledAt));
    setRescheduleError('');
  };

  const closeRescheduleDialog = () => {
    setRescheduleTarget(null);
    setRescheduleDate(null);
    setRescheduleTime(null);
    setRescheduleError('');
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleTarget) return;
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError(t('validationTimeRequired'));
      return;
    }
    // Combine date + time into ISO string using local timezone.
    const localDt = new Date(rescheduleDate);
    localDt.setHours(rescheduleTime.getHours(), rescheduleTime.getMinutes(), 0, 0);
    if (isNaN(localDt.getTime())) {
      setRescheduleError(t('validationInvalidDateTime'));
      return;
    }
    if (localDt <= new Date()) {
      setRescheduleError(t('validationFutureTime'));
      return;
    }
    setRescheduleError('');
    dispatch(
      rescheduleAppointmentRequested({
        id: rescheduleTarget.id,
        scheduledAt: localDt.toISOString(),
      })
    );
  };

  const dateTemplate = (rowData: DoctorAppointment) => {
    if (!rowData.scheduledAt) return '—';
    return new Date(rowData.scheduledAt).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US'
    );
  };

  const timeTemplate = (rowData: DoctorAppointment) => {
    if (!rowData.scheduledAt) return '—';
    return new Date(rowData.scheduledAt).toLocaleTimeString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const statusTemplate = (rowData: DoctorAppointment) => {
    const statusMap: Record<
      string,
      { severity: 'success' | 'warning' | 'danger' | 'info'; label: string }
    > = {
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

  const specialtyTemplate = (rowData: DoctorAppointment) =>
    i18n.language === 'vi'
      ? rowData.specialtyNameVi || translateEnumValue(t, 'specialty', rowData.specialtyName)
      : rowData.specialtyName || translateEnumValue(t, 'specialty', rowData.specialtyName);

  const actionsTemplate = (rowData: DoctorAppointment) => {
    const options = getNextStatuses(rowData.status);
    const showReschedule = canReschedule(rowData.status);

    if (options.length === 0 && !showReschedule) {
      return <span className="text-gray-400 text-sm italic">—</span>;
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <Button
            key={opt.value}
            label={t(opt.label)}
            size="sm"
            variant={opt.value === 'cancelled' ? 'danger' : 'primary'}
            onClick={() =>
              dispatch(updateDoctorAppointmentRequested({ id: rowData.id, status: opt.value }))
            }
            disabled={loading}
          />
        ))}
        {showReschedule && (
          <Button
            label={t('reschedule')}
            size="sm"
            variant="secondary"
            icon="pi pi-calendar"
            onClick={() => openRescheduleDialog(rowData)}
            disabled={loading}
          />
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('appointments')}
          </h1>
          <Button
            label={t('refresh')}
            icon="pi pi-refresh"
            size="sm"
            variant="secondary"
            onClick={() => dispatch(loadDoctorAppointmentsRequested())}
            disabled={loading}
          />
        </div>
        {rescheduleSuccess && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('rescheduleSuccess')}
            className="mb-4"
          />
        )}
        {appointmentUpdated && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('appointmentUpdated')}
            className="mb-4"
          />
        )}
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadDoctorAppointmentsRequested())}
            className="mb-4"
          />
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <DataTable
            value={appointments}
            paginator
            rows={10}
            loading={loading}
            emptyMessage={t('noAppointments')}
            className="primereact-table"
            sortField="scheduledAt"
            sortOrder={1}
          >
            <Column field="patientName" header={t('patient')} sortable style={{ width: '180px' }} />
            <Column
              field="specialtyName"
              header={t('specialty')}
              body={specialtyTemplate}
              sortable
              style={{ width: '160px' }}
            />
            <Column
              field="scheduledAt"
              header={t('date')}
              body={dateTemplate}
              sortable
              style={{ width: '120px' }}
            />
            <Column
              field="scheduledAt"
              header={t('time')}
              body={timeTemplate}
              style={{ width: '100px' }}
            />
            <Column field="reason" header={t('reason')} />
            <Column
              field="status"
              header={t('status')}
              body={statusTemplate}
              sortable
              style={{ width: '140px' }}
            />
            <Column body={actionsTemplate} header={t('actions')} style={{ width: '260px' }} />
          </DataTable>
        </div>
      </div>

      <Dialog
        header={t('rescheduleTitle')}
        visible={rescheduleTarget !== null}
        style={{ width: '420px' }}
        onHide={closeRescheduleDialog}
        className="p-dialog-custom"
        footer={
          <div className="flex justify-end gap-2 px-6 pb-5 pt-4">
            <Button
              label={t('cancel')}
              variant="secondary"
              size="sm"
              onClick={closeRescheduleDialog}
            />
            <Button
              label={t('submit')}
              variant="primary"
              size="sm"
              disabled={loading}
              loading={loading}
              onClick={handleRescheduleSubmit}
            />
          </div>
        }
      >
        {rescheduleTarget && (
          <div className="px-6 pt-2 pb-1 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('rescheduleInfo')}</p>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {rescheduleTarget.patientName} &mdash;{' '}
              {rescheduleTarget.scheduledAt
                ? new Date(rescheduleTarget.scheduledAt).toLocaleString(
                    i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                  )
                : '—'}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('rescheduleDate')}
              </label>
              <Calendar
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate((e.value as Date) ?? null)}
                minDate={todayDate}
                dateFormat={i18n.language === 'vi' ? 'dd/mm/yy' : 'mm/dd/yy'}
                showIcon
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('rescheduleTime')}
              </label>
              <Calendar
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime((e.value as Date) ?? null)}
                timeOnly
                hourFormat="24"
                showIcon
                className="w-full"
              />
            </div>
            {rescheduleError && (
              <p className="text-sm text-red-600 dark:text-red-400">{rescheduleError}</p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};
