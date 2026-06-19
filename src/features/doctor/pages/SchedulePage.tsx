import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadScheduleRequested,
  updateScheduleRequested,
  clearScheduleUpdated,
} from '../redux/doctor.slice';
import {
  selectSchedules,
  selectDoctorLoading,
  selectScheduleUpdated,
  selectDoctorError,
} from '../redux/doctor.selectors';
import { ScheduleTable, type EditableSlot } from '../components/ScheduleTable';
import type { Schedule } from '../types';
import { isUnauthorizedMessage } from '@/utils/authz';

let keyCounter = 0;
const makeKey = () => `slot-${++keyCounter}-${Date.now()}`;

const toEditable = (slots: Schedule[]): EditableSlot[] =>
  slots.map((s) => ({ ...s, _key: makeKey() }));

const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toTimeOnly = (value: string): Date | null => {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return new Date(1970, 0, 1, h, m, 0, 0);
};

const toTimeString = (value: Date | null): string => {
  if (!value || Number.isNaN(value.getTime())) return '';
  const h = String(value.getHours()).padStart(2, '0');
  const m = String(value.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// ── component ─────────────────────────────────────────────────────────────────
export const SchedulePage: React.FC = () => {
  const { t, i18n } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const serverSchedule = useAppSelector(selectSchedules);
  const loading = useAppSelector(selectDoctorLoading);
  const scheduleUpdated = useAppSelector(selectScheduleUpdated);
  const error = useAppSelector(selectDoctorError);

  const [localSlots, setLocalSlots] = useState<EditableSlot[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [addError, setAddError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const todayDate = useRef(new Date()).current;

  useEffect(() => {
    dispatch(loadScheduleRequested());
  }, [dispatch]);

  useEffect(() => {
    if (!isDirty) {
      setLocalSlots(toEditable(serverSchedule));
    }
  }, [serverSchedule, isDirty]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (scheduleUpdated) {
      setLocalSlots(toEditable(serverSchedule));
      setIsDirty(false);
      setSaveSuccess(true);
      timer = setTimeout(() => setSaveSuccess(false), 2000);
      dispatch(clearScheduleUpdated());
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scheduleUpdated, serverSchedule, dispatch]);

  // ── slot mutation helpers ──────────────────────────────────────────────────
  const handleChange = (key: string, field: keyof Schedule, value: string | boolean) => {
    setLocalSlots((prev) => prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)));
    setIsDirty(true);
  };

  const handleDelete = (key: string) => {
    setLocalSlots((prev) => prev.filter((s) => s._key !== key));
    setIsDirty(true);
  };

  // ── add-slot dialog ────────────────────────────────────────────────────────
  const openAddDialog = () => {
    setNewDate(null);
    setNewStart('08:00');
    setNewEnd('17:00');
    setAddError('');
    setAddDialogVisible(true);
  };

  const handleAddConfirm = () => {
    if (!newDate) {
      setAddError(t('validationDateRequired'));
      return;
    }
    if (!isValidTime(newStart)) {
      setAddError(t('validationStartTimeFormat'));
      return;
    }
    if (!isValidTime(newEnd)) {
      setAddError(t('validationEndTimeFormat'));
      return;
    }
    if (newEnd <= newStart) {
      setAddError(t('validationEndAfterStart'));
      return;
    }

    setLocalSlots((prev) => [
      ...prev,
      {
        _key: makeKey(),
        date: formatLocalDate(newDate),
        startTime: newStart,
        endTime: newEnd,
        available: true,
      },
    ]);
    setIsDirty(true);
    setAddDialogVisible(false);
  };

  const handleSave = () => {
    const invalid = localSlots.some(
      (s) => !isValidTime(s.startTime) || !isValidTime(s.endTime) || s.endTime <= s.startTime
    );
    if (invalid) return;
    const payload: Schedule[] = localSlots.map(({ _key: _k, ...rest }) => rest);
    dispatch(updateScheduleRequested(payload));
  };

  const handleDiscard = () => {
    setLocalSlots(toEditable(serverSchedule));
    setIsDirty(false);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('schedule')}
          </h1>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              icon="pi pi-plus"
              label={t('addSlot')}
              size="sm"
              onClick={openAddDialog}
            />
            {isDirty && (
              <Button
                variant="secondary"
                icon="pi pi-times"
                label={t('discardChanges')}
                size="sm"
                onClick={handleDiscard}
                disabled={loading}
              />
            )}
            <Button
              icon="pi pi-save"
              label={t('saveSchedule')}
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || loading}
              loading={loading}
            />
          </div>
        </div>
        {saveSuccess && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('scheduleSaved')}
            className="mb-4"
          />
        )}
        {error && (
          <InlineAlert
            variant="error"
            title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
            message={error}
            onRetry={() => dispatch(loadScheduleRequested())}
            className="mb-4"
          />
        )}

        {isDirty && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">
            <i className="pi pi-exclamation-triangle" />
            {t('unsavedChanges')}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 overflow-x-auto">
          <ScheduleTable
            slots={localSlots}
            loading={loading && !isDirty}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Dialog
        header={t('addSlotTitle')}
        visible={addDialogVisible}
        style={{ width: '380px' }}
        onHide={() => setAddDialogVisible(false)}
        modal
        className="p-dialog-custom"
      >
        <div className="px-6 pt-2 pb-5 space-y-4">
          {addError && <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('scheduleDate')}
            </label>
            <Calendar
              value={newDate}
              onChange={(e) => {
                setNewDate((e.value as Date) ?? null);
                setAddError('');
              }}
              minDate={todayDate}
              dateFormat={i18n.language === 'vi' ? 'dd/mm/yy' : 'mm/dd/yy'}
              showIcon
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('startTime')}
            </label>
            <Calendar
              value={toTimeOnly(newStart)}
              onChange={(e) => {
                setNewStart(toTimeString((e.value as Date) ?? null));
                setAddError('');
              }}
              timeOnly
              hourFormat="24"
              showIcon
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('endTime')}
            </label>
            <Calendar
              value={toTimeOnly(newEnd)}
              onChange={(e) => {
                setNewEnd(toTimeString((e.value as Date) ?? null));
                setAddError('');
              }}
              timeOnly
              hourFormat="24"
              showIcon
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setAddDialogVisible(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleAddConfirm}>
              {t('addSlot')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
